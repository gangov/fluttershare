import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import 'package:fluttershare/widgets/header.dart';
import 'package:fluttershare/widgets/progress.dart';

final usersRef = FirebaseFirestore.instance.collection("users");

class Timeline extends StatefulWidget {
  @override
  _TimelineState createState() => _TimelineState();
}

class _TimelineState extends State<Timeline> {
  @override
  void initState() {
    // getUserById();
    // createUser();
    deleteUser();
    // updateUser();
    super.initState();
  }

  createUser() {
    usersRef
        .doc("kura")
        .set({"username": "Jeff", "isAdmin": false, "postsCount": 0});
  }

  updateUser() async {
    final DocumentSnapshot doc = await usersRef.doc("VnlxpuH2GMsW4DuY9Mu0").get();
    // .update({"username": "Doe", "isAdmin": false, "postsCount": 0});

    if (doc.exists) {
      doc.reference.update(
          {"username": "Doe", "isAdmin": false, "postsCount": 0});
    }
  }

  deleteUser() async {
    final DocumentSnapshot doc = await usersRef.doc("VnlxpuH2GMsW4DuY9Mu0").get();

    if (doc.exists) {
      doc.reference.delete();
    }
  }

  getUserById() async {
    final String id = "UaA772Qi77dK3iiOQ59Y";
    DocumentSnapshot doc = await usersRef.doc(id).get();
    // print(doc.data);
    // print(doc.id);
    // print(doc.exists);
  }

  @override
  Widget build(context) {
    return Scaffold(
      appBar: header(context, isAppTitle: true),
      body: StreamBuilder(
        stream: usersRef.snapshots(),
        builder: (context, snapshot) {
          if (!snapshot.hasData) {
            return circularProgress();
          }

          final List<dynamic> children = snapshot.data.documents
              .map<Widget>((doc) => Text(doc['username']))
              .toList();

          return Container(
            child: ListView(
              children: children,
            ),
          );
        },
      ),
    );
  }
}
