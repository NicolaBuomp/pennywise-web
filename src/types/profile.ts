// Definizione dei tipi per il profilo utente
export interface ProfileDto {
    id: string;
    firstName: string;
    lastName: string;
    displayName: string;
    phoneNumber: string | null;
    avatarUrl: string | null;
    language: string;
    currency: string;
    theme: string;
    lastActive: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface UpdateProfileRequest {
    firstName?: string;
    lastName?: string;
    displayName?: string;
    phoneNumber?: string;
    language?: string;
    currency?: string;
    theme?: string;
}