import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export interface NetworkChat {
  networkId: string;
  ecosystemCode: string;
  allowedUids: string[];
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  senderUid: string;
  text: string;
  timestamp: number;
  replyTo: {
    messageId: string;
    text: string;
    senderUid: string;
  } | null;
  reactions: Record<string, string>;
}

export const chatMessageConverter = {
  toFirestore: (message: ChatMessage): FirebaseFirestoreTypes.DocumentData => {
    return {
      ...message,
    };
  },
  fromFirestore: (
    snapshot: FirebaseFirestoreTypes.QueryDocumentSnapshot
  ): ChatMessage => {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      senderUid: data.senderUid,
      text: data.text,
      timestamp: data.timestamp,
      replyTo: data.replyTo || null,
      reactions: data.reactions || {},
    };
  },
};
