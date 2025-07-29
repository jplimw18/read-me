export interface GutenbergAuthor {
    name: string;
    birth_year: number | null;
    death_year: number | null;
};

export interface GutenbergBook {
    id: number;
    title: string;
    authors: GutenbergAuthor[];
    summaries?: string[];
    subjects: string[];
    bookshelves: string[];
    languages: string[];
    copyright: boolean | null;
    download_count: number;
    media_type: string;
    translators?: string[];
    formats: Record<string, string>;
};

interface GutenbergResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: GutenbergBook[];
};

const API_URL = "https://gutendex.com/books";

interface SearchParams {
    search?: string;
    languages?: string[];
    topic?: string;
    sort?: 'ascending' | 'descending' | 'popular';
    author_year_start?: number;
    author_year_end?: number;
    copyright?: boolean | null;
    page?: number; 
};

export async function searchBooks(params: SearchParams): Promise<GutenbergResponse> {
    try {
        const query = new URLSearchParams();
        if (params.search) query.append('search', params.search);
        if (params.languages) query.append('languages', params.languages.join(','));
        if (params.topic) query.append('topic', params.topic);
        if (params.sort) query.append('sort', params.sort);
        if (params.author_year_start !== undefined) query.append('author_year_start', params.author_year_start.toString());
        if (params.author_year_end !== undefined) query.append('author_year_end', params.author_year_end.toString());
        if (params.copyright !== undefined) query.append('copyright', String(params.copyright));
        if (params.page != undefined) query.append('page', params.page.toString());

        const fullUrl = `${API_URL}?search=${encodeURIComponent(query.toString())}`;
        const response = await fetch(fullUrl);

        if (!response.ok)
            throw new Error(`Falha ao realizar requisição ${response.status}`);

        const data: GutenbergResponse = await response.json();

        return data;
    } catch (err) {
        console.error(`Falha ao buscar livros: ${err}`);
        throw err;
    }
}

export async function findBookById(id: number): Promise<GutenbergBook | null> {
    try {
        const fullUrl = `${API_URL}/${id}`;

        const response = await fetch(fullUrl);

        if (!response.ok)
                if(response.status === 404)
                    throw new Error(`Falha ao realizar requisição: ${response.status}`);

        const data: GutenbergBook = await response.json();
        
        return data;
    } catch (err) {
        console.error(`Falha ao buscar livro: ${err}`);
        throw err;
    }
}

export interface SearchResult {
    books: GutenbergBook[];
    nextPage: string | null;
    previousPage: string | null;
}

export async function searchWithPagination(params: SearchParams = {}): Promise<SearchResult> {
    const res = await searchBooks(params);
    return {
        books: res.results,
        nextPage: res.next,
        previousPage: res.previous
    };
} 