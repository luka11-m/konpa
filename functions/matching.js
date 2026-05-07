const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

exports.autoMatch = functions.firestore
  .document('matchingConditions/{conditionId}')
  .onCreate(async (snap, context) => {
    const newCondition = snap.data();
    const newConditionId = snap.id;
    const groupId = newCondition.groupId;

    try {
      // Get the group to find gender and member info
      const groupSnap = await db.collection('groups').doc(groupId).get();
      if (!groupSnap.exists) {
        console.log(`Group ${groupId} not found`);
        return;
      }

      const groupData = groupSnap.data();
      const groupGender = groupData.gender;
      const oppositeGender = groupGender === 'male' ? 'female' : 'male';

      // Find opposite gender groups with matching conditions
      const query = db.collection('matchingConditions')
        .where('status', '==', 'pending')
        .where('preferredArea', '==', newCondition.preferredArea)
        .where('budget', '==', newCondition.budget);

      const snapshot = await query.get();

      for (const doc of snapshot.docs) {
        if (doc.id === newConditionId) continue;

        const otherCondition = doc.data();
        const otherGroupId = otherCondition.groupId;

        // Verify group exists and check gender
        const otherGroupSnap = await db.collection('groups').doc(otherGroupId).get();
        if (!otherGroupSnap.exists) continue;

        const otherGroupData = otherGroupSnap.data();
        if (otherGroupData.gender !== oppositeGender) continue;

        // Check if preferred dates overlap
        const datesOverlap = newCondition.preferredDates.some(date =>
          otherCondition.preferredDates.includes(date)
        );

        if (datesOverlap) {
          // Match found!
          const maleGroupId = groupGender === 'male' ? groupId : otherGroupId;
          const femaleGroupId = groupGender === 'female' ? groupId : otherGroupId;
          const matchedDate = newCondition.preferredDates.find(date =>
            otherCondition.preferredDates.includes(date)
          );

          const matchDoc = {
            maleGroupId,
            femaleGroupId,
            matchedArea: newCondition.preferredArea,
            matchedBudget: newCondition.budget,
            matchedDate,
            status: 'pending_payment',
            paymentStatus: 'pending',
            createdAt: admin.firestore.FieldValue.serverTimestamp()
          };

          const newMatch = await db.collection('matches').add(matchDoc);

          // Update both conditions to matched
          await db.collection('matchingConditions').doc(newConditionId).update({
            status: 'matched',
            matchId: newMatch.id
          });

          await db.collection('matchingConditions').doc(doc.id).update({
            status: 'matched',
            matchId: newMatch.id
          });

          console.log(`Match created: ${newMatch.id}`);
          break;
        }
      }
    } catch (error) {
      console.error('Error in autoMatch:', error);
    }
  });
