/**
 * ContentStorageService
 * Mocks the Supabase storage layer described in the spec.
 * Maps content hashes to plain text confessions using localStorage.
 */
class ContentStorageService {
    private readonly STORAGE_KEY = 'zk_confession_content_cache';

    constructor() {
        this.init();
    }

    private init() {
        if (!localStorage.getItem(this.STORAGE_KEY)) {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify({}));
        }
    }

    /**
     * Store confession text by its hash
     */
    saveContent(hash: string, text: string): void {
        try {
            const cache = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
            cache[hash] = text;
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cache));
        } catch (e) {
            console.error('Error saving to content cache:', e);
        }
    }

    /**
     * Retrieve confession text by its hash
     */
    getContent(hash: string): string | null {
        try {
            const cache = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
            return cache[hash] || null;
        } catch (e) {
            console.error('Error reading from content cache:', e);
            return null;
        }
    }

    /**
     * Pre-populate with some "Community" confessions
     */
    seedInitialContent() {
        try {
            const cache = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');

            // Adding samples for some common entry IDs and hashes
            const samples = {
                'sample_1': 'I use the office printer to print my 200-page screenplay every weekend. 📑',
                'sample_2': 'I once accidentally sent a "Miss you" text to my boss instead of my partner. 😳',
                'sample_3': 'I pretend to be in meetings just so I can play Elden Ring for 3 hours a day. 🎮',
                'id_6': 'I borrowed 500 XLM from the community pool and "forgot" to pay it back. 🤫',
                'id_5': 'I secretly enjoy pineapple on pizza and I don\'t care what the internet says. 🍕'
            };

            let updated = false;
            for (const [key, text] of Object.entries(samples)) {
                if (!cache[key]) {
                    cache[key] = text;
                    updated = true;
                }
            }

            if (updated) {
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cache));
                console.log('✅ Seeding initial content cache with samples.');
            }
        } catch (e) {
            console.error('Error seeding content:', e);
        }
    }
}


export const contentStorage = new ContentStorageService();
