import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Saved Decks - Lotería Online',
  description: 'View and manage your saved custom card decks',
};

export default function SavedDecksPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Saved Decks</h1>
      <div className="text-center">
        <p className="text-gray-600 mb-4">Your saved custom decks will appear here.</p>
        <p className="text-sm text-gray-500">Feature coming soon!</p>
      </div>
    </div>
  );
}