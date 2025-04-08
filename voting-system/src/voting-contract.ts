import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { Election, Vote } from './model';

@Info({ title: 'VotingContract', description: 'Smart contract for managing elections' })
export class VotingContract extends Contract {

    @Transaction()
    public async InitLedger(ctx: Context): Promise<void> {
        console.info('============= START : Initialize Ledger ===========');

        const elections: Election[] = [
            {
                electionId: 'election1',
                name: 'Presidential Election 2024',
                description: 'Election for the President of the United States',
                candidates: ['candidate1', 'candidate2'],
                isActive: true,
                startDate: '2024-01-01',
                endDate: '2024-11-08',
                votes: []
            },
            {
                electionId: 'election2',
                name: 'Local Election 2024',
                description: 'Local elections for city council members',
                candidates: ['candidate3', 'candidate4'],
                isActive: true,
                startDate: '2024-02-01',
                endDate: '2024-11-08',
                votes: []
            }
        ];

        for (const election of elections) {
            await ctx.stub.putState(election.electionId, Buffer.from(JSON.stringify(election)));
            console.info(`Election ${election.electionId} initialized`);
        }

        console.info('============= END : Initialize Ledger ===========');
    }

    @Transaction()
    public async CreateElection(ctx: Context, idProvided: string, nameProvided: string, descriptionProvided: string, candidatesProvided: string, startDateProvided: string, endDateProvided: string): Promise<void> {
        let candidatesParsed: string[];
        try {
            candidatesParsed = JSON.parse(candidatesProvided);
            if (!Array.isArray(candidatesParsed)) {
                throw new Error('Candidates must be a valid JSON array of strings');
            }
        } catch (error) {
            throw new Error('Invalid candidates format. Must be a valid JSON array string');
        }

        const election: Election = {
            electionId: idProvided,
            name: nameProvided,
            description: descriptionProvided,
            candidates: candidatesParsed,
            isActive: true,
            startDate: startDateProvided,
            endDate: endDateProvided,
            votes: []
        };

        await ctx.stub.putState(idProvided, Buffer.from(JSON.stringify(election)));
    }

    @Transaction(false)
    @Returns('Election')
    public async GetElection(ctx: Context, electionId: string): Promise<Election> {
        const electionJSON = await ctx.stub.getState(electionId);
        if (!electionJSON || electionJSON.length === 0) {
            throw new Error(`The election ${electionId} does not exist`);
        }
        return JSON.parse(electionJSON.toString());
    }

    @Transaction()
    public async CastVote(ctx: Context, electionId: string, voterId: string, candidateId: string): Promise<void> {
        const election = await this.GetElection(ctx, electionId);

        // Check if election is active
        if (!election.isActive) {
            throw new Error('This election is not active');
        }

        // Check if candidate exists
        if (!election.candidates.includes(candidateId)) {
            throw new Error('Invalid candidate');
        }

        // Check if voter has already voted
        const hasVoted = election.votes.some(vote => vote.voterId === voterId);
        if (hasVoted) {
            throw new Error('Voter has already cast a vote in this election');
        }

        // Add vote
        const vote: Vote = {
            voterId,
            candidateId,
            timestamp: new Date().toISOString()
        };
        election.votes.push(vote);

        await ctx.stub.putState(electionId, Buffer.from(JSON.stringify(election)));
    }

    @Transaction()
    public async EndElection(ctx: Context, electionId: string): Promise<void> {
        const election = await this.GetElection(ctx, electionId);
        election.isActive = false;
        await ctx.stub.putState(electionId, Buffer.from(JSON.stringify(election)));
    }

    @Transaction(false)
    @Returns('string')
    public async GetElectionResults(ctx: Context, electionId: string): Promise<string> {
        const election = await this.GetElection(ctx, electionId);
        
        // Count votes for each candidate
        const results = election.candidates.reduce((acc, candidate) => {
            acc[candidate] = election.votes.filter(vote => vote.candidateId === candidate).length;
            return acc;
        }, {} as { [key: string]: number });

        return JSON.stringify(results);
    }

    @Transaction(false)
    @Returns('boolean')
    public async VerifyVote(ctx: Context, electionId: string, voterId: string): Promise<boolean> {
        const election = await this.GetElection(ctx, electionId);
        return election.votes.some(vote => vote.voterId === voterId);
    }

    @Transaction(false)
    @Returns('string')
    public async GetAllElections(ctx: Context): Promise<string> {
        const startKey = '';
        const endKey = '';
        const allResults = [];
        
        for await (const {value} of ctx.stub.getStateByRange(startKey, endKey)) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push(record);
        }
        
        return JSON.stringify(allResults);
    }
}
