
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const proposalId = 'b52be42f-71da-4d5e-8147-363259273f7b';
    const proposal = await prisma.leaseProposal.findUnique({
        where: { id: proposalId },
    });

    if (!proposal) {
        console.log('Proposal not found');
        return;
    }

    console.log('Proposal Data:');
    console.log('Curriculum:', JSON.stringify(proposal.curriculum, null, 2));
    console.log('Enrollment:', JSON.stringify(proposal.enrollment, null, 2));
    console.log('Rent Model:', proposal.rentModel);
    console.log('Rent Params:', JSON.stringify(proposal.rentParams, null, 2));
    console.log('Other OpEx Percent:', proposal.otherOpexPercent); 

    // Check CapEx
    // console.log('CapEx:', JSON.stringify(proposal.capex, null, 2));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
