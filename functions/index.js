const functions = require("firebase-functions");
const admin = require("@google-cloud/firestore/build/protos/firestore_v1_proto_api");

exports.onCreateFollower = functions
    .firestore
    .document("/followers/{userId}/userFollowers/{followerId")
    .onCreate((snapshot, context) => {
        console.log("Follower created", snapshot.data());

        const userId = context.params.userId;
        const followerId = context.params.followerId;

        const followedUserPostsRed = admin
            .firestore
            .collection('posts')
            .doc(userId)
            .collection('userPosts');

        const timelinePostsRef = admin
            .firestore
            .collection('timeline')
            .doc(followerId)
            .collection('timelinePosts');

        const querySnapshot = followedUserPostsRed.get();

        querySnapshot.forEach(doc => {
            if (doc.exists) {
                const postId = doc.id;
                const postData = doc.data();
                timelinePostsRef.doc(postId).set(postData);
            }
        })
    })
