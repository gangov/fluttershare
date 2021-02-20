const functions = require("firebase-functions");
const admin = require("@google-cloud/firestore/build/protos/firestore_v1_proto_api");

exports.onCreateFollower = functions
    .firestore
    .document("/followers/{userId}/userFollowers/{followerId}")
    .onCreate(async (snapshot, context) => {
        console.log("Follower created", snapshot.data());

        const userId = context.params.userId;
        const followerId = context.params.followerId;

        const followedUserPostsRef = admin
            .firestore
            .collection('posts')
            .doc(userId)
            .collection('userPosts');

        const timelinePostsRef = admin
            .firestore
            .collection('timeline')
            .doc(followerId)
            .collection('timelinePosts');

        const querySnapshot = followedUserPostsRef.get();

        querySnapshot.forEach(doc => {
            if (doc.exists) {
                const postId = doc.id;
                const postData = doc.data();
                timelinePostsRef.doc(postId).set(postData);
            }
        });
    });

exports.onUpdatePost = functions
    .firestore
    .document("/posts/{userId}/userPosts/{postId}")
    .onUpdate(async (change, context) => {

        const postUpdated = change.after.data();
        const userId = context.params.userId;
        const postId = context.params.postId;


        const userFollowersRef = admin
            .firestore
            .collection('followers')
            .doc(userId)
            .collection('userFollowers');

        const querySnapshot = userFollowersRef.get();

        querySnapshot.forEach(doc => {
            if (doc.exists) {
                doc.ref.update(postUpdated);
            }
        });
    });

exports.onDeletePost = functions
    .firestore
    .document("/posts/{userId}/userPosts/{postId}")
    .onDelete(async (snapshot, context) => {

        const userId = context.params.userId;
        const postId = context.params.postId;


        const userFollowersRef = admin
            .firestore
            .collection('followers')
            .doc(userId)
            .collection('userFollowers');

        const querySnapshot = userFollowersRef.get();

        querySnapshot.forEach(doc => {
            const followerId = doc.id;

            admin
                .firestore
                .collection('timeline')
                .doc(followerId)
                .collection('timelinePosts')
                .doc(postId)
                .get()
                .then(doc => {
                    if (doc.exists) {
                        doc.ref.delete();
                    }
                });
        });
    });

exports.onCreateActivityFeedItem = functions
    .firestore
    .document('/feed/{userId}/feedItems/{activityFeedItem}')
    .onCreate(async (snapshot, context) => {
        console.log('Activity feed item created', snapshot.data());

        const userId = context.params.userId;

        const userRef = admin.firestore.doc(`users/${userId}`);
        const doc = await userRef.get();

        const androidNotificationToken = doc.data().androidNotificationToken;

        const createdActivityFeedItem = snapshot.data();

        if (androidNotificationToken) {
            sendNotification(androidNotificationToken, createdActivityFeedItem);
        } else {
            console.log('No token found');
        }

        function sendNotification(androidNotificationToken, activityFeedItem) {
            let body;

            switch (activityFeedItem.type) {
                case "comment":
                    body = `${activityFeedItem.username} replied: ${activityFeedItem.commentData}`;
                    break;
                case "like":
                    body = `${activityFeedItem.username} liked your post`;
                    break;
                case "follow":
                    body = `${activityFeedItem.username} followed you`;
                    break;
                default:
                    break;
            }

            const message = {
                notification: {body},
                token: androidNotificationToken,
                data: {recipient: userId}
            };

            admin.messaging().send(message).then(response => {
                console.log('message sent ', response);
            }).catch(error => {
                console.log("error was ", error);
            });
        }
    });
