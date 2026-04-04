const SUPABASE_URL = 'https://pyxeusrxoizjlihyqhac.supabase.co';
const SUPABASE_KEY = 'sb_publishable_u1vYpwFYhvou2oyvsxoNIQ_1WDklzXt';

const NEIGHBORHOODS = [
    { id: 'all', name: 'الكل', icon: '🌍' },
    { id: 'center', name: 'وسط المدينة', icon: '🏙️' },
    { id: 'masira', name: 'حي المسيرة', icon: '🏘️' },
    { id: 'salam', name: 'حي السلام', icon: '🕊️' },
    { id: 'taawon', name: 'حي التعاون', icon: '🤝' }
];

const neighborhoodMap = {
    'all': 'الكل', 'center': 'وسط المدينة', 'masira': 'المسيرة',
    'salam': 'السلام', 'taawon': 'التعاون'
};
