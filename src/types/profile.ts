export interface ProfileDto {
    id: string;
    first_name: string;
    last_name: string;
    display_name: string;
    phone_number: string | null;
    avatar_url: string | null;
    language: string;
    currency: string;
    last_active: string | null;
    created_at: string;
    updated_at: string;
}

export interface UpdateProfileRequest {
    first_name?: string;
    last_name?: string;
    display_name?: string;
    phone_number?: string;
    language?: string;
    currency?: string;
}
