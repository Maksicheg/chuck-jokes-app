export interface Joke {
    id: string;
    value: string;
    dateCreated?: Date;
    iconUrl?: string;
    dateUpdated?: Date;
    url?: string;
    categories: Array<CategoryInterface>;
    favorite: boolean;
}

export interface CategoryInterface {
    id: number | string;
    title: string;
}
