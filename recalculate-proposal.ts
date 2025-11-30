/**
 * Recalculate a specific proposal
 */

const proposalId = 'b52be42f-71da-4d5e-8147-363259273f7b';

async function recalculateProposal() {
  try {
    console.log(`Recalculating proposal ${proposalId}...`);

    const response = await fetch(`http://localhost:3000/api/proposals/${proposalId}/recalculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Failed to recalculate:', error);
      process.exit(1);
    }

    const result = await response.json();
    console.log('✅ Recalculation successful!');
    console.log('Metrics:', JSON.stringify(result.metrics, null, 2));

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

recalculateProposal();
