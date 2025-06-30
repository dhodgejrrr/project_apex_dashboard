import React, { useEffect } from 'react';
import { useTavus } from '../src/hooks/useTavus';

const TavusTest: React.FC = () => {
  const { startConversation, conversationId, error, isLoading } = useTavus();

  useEffect(() => {
    // Test the API connection with a simple context
    const testContext = "The user is analyzing race data.";
    startConversation(testContext);
  }, [startConversation]);

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-2">Tavus API Test</h3>
      <div className="space-y-2">
        <p><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
        <p><strong>Conversation ID:</strong> {conversationId || 'None'}</p>
        <p><strong>Error:</strong> {error ? error.message : 'None'}</p>
      </div>
    </div>
  );
};

export default TavusTest;
