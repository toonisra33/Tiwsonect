// scripts/sync-github-to-firestore.mjs
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { 
  initializeFirestore, 
  collection, 
  doc, 
  setDoc 
} from 'firebase/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runSync() {
  console.log('----------------------------------------------------');
  console.log('🔄 TiWsonect: GitHub -> Cloud Firestore Data Syncer');
  console.log('----------------------------------------------------');

  const configPath = resolve(__dirname, '../firebase-applet-config.json');
  if (!existsSync(configPath)) {
    console.error('❌ Error: firebase-applet-config.json not found!');
    process.exit(1);
  }

  const firebaseConfig = JSON.parse(readFileSync(configPath, 'utf8'));
  console.log(`📡 Connecting to Firebase Project: ${firebaseConfig.projectId}`);
  console.log(`🗄️ Database ID: ${firebaseConfig.firestoreDatabaseId || '(default)'}`);

  const app = initializeApp({
    apiKey: firebaseConfig.apiKey,
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId,
    storageBucket: firebaseConfig.storageBucket,
    messagingSenderId: firebaseConfig.messagingSenderId,
    appId: firebaseConfig.appId,
  });

  const db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
  }, firebaseConfig.firestoreDatabaseId);

  // Load Seed Posts
  const postsPath = resolve(__dirname, '../data/github_posts.json');
  if (existsSync(postsPath)) {
    const rawPosts = JSON.parse(readFileSync(postsPath, 'utf8'));
    console.log(`\n📦 Found ${rawPosts.length} post(s) in data/github_posts.json`);

    let uploadedCount = 0;
    for (const post of rawPosts) {
      const docId = post.id || `gh-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const postPayload = {
        userId: post.userId || 'admin',
        content: post.content,
        images: post.images || [],
        videoUrl: post.videoUrl || null,
        likes: post.likes || [],
        comments: post.comments || [],
        savedBy: post.savedBy || [],
        type: post.type || (post.videoUrl ? 'video' : 'image'),
        mood: post.mood || 'GitHub Sync 🚀',
        locationName: post.locationName || 'GitHub',
        tags: post.tags || ['github', 'sync'],
        source: 'github-repository',
        syncedAt: Date.now(),
        timestamp: post.timestamp || Date.now()
      };

      try {
        const postRef = doc(db, 'posts', docId);
        await setDoc(postRef, postPayload, { merge: true });
        uploadedCount++;
        console.log(`  ✅ [${uploadedCount}/${rawPosts.length}] Synced Post ID: ${docId}`);
      } catch (err) {
        console.error(`  ⚠️ Failed to sync Post ID ${docId}:`, err.message);
      }
    }
    console.log(`🎉 Finished syncing ${uploadedCount}/${rawPosts.length} posts to Firestore!`);
  } else {
    console.log('ℹ️ No data/github_posts.json file found to sync.');
  }

  // Load Seed Users if present
  const usersPath = resolve(__dirname, '../data/github_users.json');
  if (existsSync(usersPath)) {
    const rawUsers = JSON.parse(readFileSync(usersPath, 'utf8'));
    console.log(`\n👥 Found ${rawUsers.length} user(s) in data/github_users.json`);

    let userCount = 0;
    for (const user of rawUsers) {
      const docId = user.id || `user-gh-${Date.now()}`;
      try {
        const userRef = doc(db, 'users', docId);
        await setDoc(userRef, {
          ...user,
          syncedAt: Date.now()
        }, { merge: true });
        userCount++;
        console.log(`  ✅ [${userCount}/${rawUsers.length}] Synced User ID: ${docId} (${user.name})`);
      } catch (err) {
        console.error(`  ⚠️ Failed to sync User ID ${docId}:`, err.message);
      }
    }
    console.log(`🎉 Finished syncing ${userCount}/${rawUsers.length} users to Firestore!`);
  }

  console.log('\n✨ GitHub to Cloud Firestore synchronization complete!');
  process.exit(0);
}

runSync().catch((err) => {
  console.error('Fatal sync error:', err);
  process.exit(1);
});
