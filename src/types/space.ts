// src/types/space.ts

export interface ReservedTime {
start: string; // YYYY-MM-DD
end: string;   // YYYY-MM-DD
}

export interface Space {
id: string;
accessibility?: string; // e.g., "24/7"
address?: string;
blockedTimes?: any[]; // keep as array of unknown objects for now
contracts?: Record<string, any>; // dynamic contract maps
description?: string;
endDate?: Date;       // optional for reservations? keep if relevant
requestedAt?: Date;   // optional
startDate?: Date;     // optional
state?: string;       // e.g., "requested"
userId: string;

createdAt?: Date;
mainImage?: string;
postType?: string;    // e.g., "Offering"
price: string;        // Firestore stores as string
reservedTimes?: ReservedTime[];
security?: string[];
storageType?: string; // e.g., "Indoor"
title?: string;
usageType?: string[];
}
