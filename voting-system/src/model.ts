// models.ts

export interface Vote {
    voterId: string;
    candidateId: string;
    timestamp: string;
}

export interface Election {
    electionId: string;
    name: string;
    description: string;
    candidates: string[];
    isActive: boolean;
    startDate: string;
    endDate: string;
    votes: Vote[];
}