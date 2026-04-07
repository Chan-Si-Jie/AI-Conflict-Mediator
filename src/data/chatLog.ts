export interface ChatMessage {
  id: string;
  timestamp: string;
  user: string;
  content: string;
  type: 'message' | 'system';
}

export const initialChatLog: ChatMessage[] = [
  { id: 'm1', timestamp: '14:05:00', user: 'DramaKing', content: 'bro that drama was trash, how can anyone like it 😂', type: 'message' },
  { id: 'm2', timestamp: '14:05:08', user: 'K-DramaFan', content: 'excuse me?? it won best drama award, ur taste is just bad lol', type: 'message' },
  { id: 'm3', timestamp: '14:05:22', user: 'DramaKing', content: 'awards dont mean anything, ppl who like that show have zero taste fr', type: 'message' },
  { id: 'm4', timestamp: '14:05:30', user: 'SilentViewer', content: '😬😬😬', type: 'message' },
  { id: 'm5', timestamp: '14:05:45', user: 'K-DramaFan', content: 'lmao says the guy whose profile pic is from a 2015 anime, go back to ur basement', type: 'message' },
  { id: 'm6', timestamp: '14:06:02', user: 'DramaKing', content: 'at least im not some braindead fan who worships everything korea makes, typical', type: 'message' },
  { id: 'm7', timestamp: '14:06:10', user: 'PeaceLover', content: 'guys chill its just a show...', type: 'message' },
  { id: 'm8', timestamp: '14:06:25', user: 'K-DramaFan', content: 'shut up nobody asked u. and @DramaKing ur literally the dumbest person in this room rn', type: 'message' },
  { id: 'm9', timestamp: '14:06:28', user: 'System', content: 'NewUser_823 left the room', type: 'system' },
  { id: 'm10', timestamp: '14:06:35', user: 'System', content: 'JustHere4Fun left the room', type: 'system' },
];
