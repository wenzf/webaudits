import { roundToTwoDigits } from "./utils"
import { score_by_crux_distribution } from "./calculate_scores_by_stats"


export const convert_crux = (useCase: "page" | "origin") => (
    crux_response: CrUXResponse) => {
    if (
        crux_response?.id
        && crux_response.overall_category
        && crux_response.metrics
        && crux_response.initial_url
    ) {
        if (useCase === "page"
            && crux_response.origin_fallback === true) {
            return null
        }

        const overall = crux_response.overall_category
        const metricsKeyValueArr = Object.entries(crux_response.metrics) as [
            CrUXMetricTypes, CrUXMetricItem][]
        let crux_metrics: AuditCrUXMetric[] = []
        let scoreSum = 0

        for (let i = 0; i < metricsKeyValueArr.length; i += 1) {
            const [type, item] = metricsKeyValueArr[i]

            const score_category = item.category
            const distribution = item.distributions
            const score_linear_unrounded = score_by_crux_distribution(item)
            const score_linear = roundToTwoDigits(score_linear_unrounded)
            scoreSum += score_linear_unrounded

            crux_metrics = [...crux_metrics, {
                score_category, distribution, score_linear, type, percentile: item.percentile
            }]
        }
        const overall_linear = roundToTwoDigits(scoreSum / (metricsKeyValueArr.length + 1))

        return {
            overall_linear,
            overall,
            crux_metrics
        }
    } else {
        return null
    }
} 


const languageSuffixes = [
    // --- ISO 639-1 (Alpha-2) Codes (184 codes) ---
    'aa', 'ab', 'ae', 'af', 'ak', 'am', 'an', 'ar', 'as', 'av', 'ay', 'az', 'ba', 'be', 'bg', 'bh', 'bi',
    'bm', 'bn', 'bo', 'br', 'bs', 'ca', 'ce', 'ch', 'co', 'cr', 'cs', 'cu', 'cv', 'cy', 'da', 'de', 'dv',
    'dz', 'ee', 'el', 'en', 'eo', 'es', 'et', 'eu', 'fa', 'ff', 'fi', 'fj', 'fo', 'fr', 'fy', 'ga', 'gd',
    'gl', 'gn', 'gu', 'gv', 'ha', 'he', 'hi', 'ho', 'hr', 'ht', 'hu', 'hy', 'hz', 'ia', 'id', 'ie', 'ig',
    'ii', 'ik', 'io', 'is', 'it', 'iu', 'ja', 'jv', 'ka', 'kg', 'ki', 'kj', 'kk', 'kl', 'km', 'kn', 'ko',
    'kr', 'ks', 'ku', 'kv', 'kw', 'ky', 'la', 'lb', 'lg', 'li', 'ln', 'lo', 'lt', 'lu', 'lv', 'mg', 'mh',
    'mi', 'mk', 'ml', 'mn', 'mr', 'ms', 'mt', 'my', 'na', 'nb', 'nd', 'ne', 'ng', 'nl', 'nn', 'no', 'nr',
    'nv', 'ny', 'oc', 'oj', 'om', 'or', 'os', 'pa', 'pi', 'pl', 'ps', 'pt', 'qu', 'rm', 'rn', 'ro', 'ru',
    'rw', 'sa', 'sc', 'sd', 'se', 'sg', 'sh', 'si', 'sk', 'sl', 'sm', 'sn', 'so', 'sq', 'sr', 'ss', 'st',
    'su', 'sv', 'sw', 'ta', 'te', 'tg', 'th', 'ti', 'tk', 'tl', 'tn', 'to', 'tr', 'ts', 'tt', 'tw', 'ty',
    'ug', 'uk', 'ur', 'uz', 've', 'vi', 'vo', 'wa', 'wo', 'xh', 'yi', 'yo', 'za', 'zh', 'zu',

    // --- ISO 639-2/B (Alpha-3) Codes (Partial list, including common/legacy codes) ---
    // Note: ISO 639-2 includes over 480 codes, including macrolanguages and language groups.
    // This list includes codes that do *not* have a 639-1 equivalent, or are common macrolanguages.
    'aar', 'abk', 'ace', 'ach', 'ada', 'ady', 'afa', 'afh', 'afr', 'ain', 'akk', 'ale', 'amh', 'ang',
    'anp', 'apa', 'ara', 'arc', 'arg', 'arn', 'arp', 'art', 'arw', 'asm', 'ast', 'ath', 'aus', 'ava',
    'ave', 'awa', 'aym', 'aze', 'bad', 'bai', 'bak', 'bal', 'bam', 'ban', 'bas', 'bej', 'bel', 'bem',
    'ben', 'bho', 'bik', 'bin', 'bis', 'bla', 'bod', 'bos', 'bra', 'bre', 'bua', 'bug', 'bul', 'bur',
    'byn', 'cad', 'cai', 'car', 'cat', 'ceb', 'cel', 'cha', 'chb', 'che', 'chg', 'chk', 'chm', 'chn',
    'cho', 'chp', 'chr', 'chu', 'chv', 'chy', 'cmc', 'cop', 'cor', 'cos', 'cpe', 'cpf', 'cpp', 'cre',
    'crh', 'crp', 'csb', 'cus', 'cym', 'cze', 'dag', 'dan', 'dar', 'day', 'del', 'den', 'deu', 'dgr',
    'din', 'div', 'doi', 'dra', 'dsb', 'dua', 'dum', 'dut', 'dyu', 'dzo', 'efi', 'egy', 'eka', 'ell',
    'eng', 'enm', 'epo', 'est', 'eus', 'ewe', 'ewo', 'fan', 'fao', 'fas', 'fat', 'fij', 'fil', 'fin',
    'fiu', 'fon', 'fre', 'frm', 'fro', 'frr', 'frs', 'fry', 'ful', 'gaa', 'gay', 'gba', 'gem', 'geo',
    'ger', 'gez', 'gil', 'gla', 'gle', 'glg', 'glv', 'gmh', 'goh', 'gon', 'gor', 'got', 'grb', 'grc',
    'grn', 'gsw', 'guj', 'gwi', 'hai', 'hat', 'hau', 'haw', 'hgm', 'hmn', 'hmo', 'hrv', 'hsb', 'hun',
    'hup', 'hye', 'iba', 'ibo', 'ice', 'ido', 'iii', 'ijo', 'iku', 'ile', 'ilo', 'ina', 'inc', 'ind',
    'ine', 'inh', 'ipk', 'ira', 'iri', 'iro', 'isl', 'ita', 'jav', 'jbo', 'jpn', 'jpr', 'jrb', 'kaa',
    'kab', 'kac', 'kal', 'kam', 'kan', 'kar', 'kas', 'kat', 'kau', 'kaw', 'kaz', 'kbd', 'kha', 'khi',
    'khm', 'kho', 'kik', 'kin', 'kir', 'kmb', 'kok', 'kom', 'kon', 'kor', 'kos', 'kpe', 'krc', 'krl',
    'kro', 'kru', 'kua', 'kum', 'kur', 'kut', 'lad', 'lah', 'lam', 'lao', 'lat', 'lav', 'lez', 'lim',
    'lin', 'lit', 'lol', 'loz', 'ltz', 'lua', 'lub', 'lug', 'lui', 'lun', 'luo', 'lus', 'mac', 'mad',
    'mag', 'mah', 'mai', 'mak', 'mal', 'man', 'map', 'mar', 'mas', 'mdf', 'mdr', 'men', 'mga', 'mic',
    'min', 'mis', 'mkh', 'mlg', 'mlt', 'mnc', 'mni', 'mno', 'moh', 'mon', 'mos', 'mri', 'msa', 'mul',
    'mun', 'mus', 'mwl', 'mwr', 'mya', 'myn', 'myv', 'nah', 'nai', 'nap', 'nau', 'nav', 'nbl', 'nde',
    'ndo', 'nds', 'nep', 'new', 'nia', 'nic', 'niu', 'nno', 'nob', 'nog', 'non', 'nor', 'nso', 'nub',
    'nwc', 'nya', 'nym', 'nyn', 'nzi', 'oci', 'oji', 'ori', 'orm', 'osa', 'oss', 'ota', 'oto', 'paa',
    'pag', 'pal', 'pam', 'pan', 'pap', 'pau', 'peo', 'per', 'phi', 'phn', 'pli', 'pol', 'pon', 'por',
    'pra', 'pro', 'pus', 'que', 'raj', 'rap', 'rar', 'roa', 'roh', 'rom', 'ron', 'run', 'rup', 'rus',
    'sad', 'sag', 'sah', 'sai', 'sal', 'sam', 'san', 'sas', 'sat', 'scc', 'sco', 'scr', 'sel', 'sem',
    'sga', 'sgn', 'shn', 'sid', 'sin', 'sio', 'sit', 'sla', 'slk', 'slo', 'slv', 'sme', 'smo', 'sna',
    'snd', 'snh', 'snk', 'sog', 'som', 'son', 'sot', 'spa', 'sqi', 'srd', 'srn', 'srp', 'srr', 'ssa',
    'ssw', 'suk', 'sun', 'sus', 'sux', 'swa', 'swe', 'syc', 'syr', 'tah', 'tai', 'tam', 'tat', 'tel',
    'tem', 'ter', 'tet', 'tgk', 'tgl', 'tha', 'tib', 'tig', 'tik', 'tiv', 'tkl', 'tlh', 'tli', 'tmh',
    'tog', 'ton', 'tpi', 'tsi', 'tsn', 'tso', 'tuk', 'tum', 'tup', 'tur', 'tut', 'tvl', 'twi', 'tyv',
    'udm', 'uga', 'uig', 'ukr', 'umb', 'und', 'urd', 'uzb', 'vai', 'ven', 'vie', 'vol', 'vot', 'wak',
    'wal', 'war', 'was', 'wel', 'wen', 'wln', 'wol', 'xho', 'yao', 'yap', 'yid', 'yor', 'ypk', 'zap',
    'zbl', 'zen', 'zha', 'znd', 'zul', 'zun', 'zxx', 'zza',
];


export default function is_root_page(url: string) {
    const pathname = new URL(url).pathname.toLowerCase()
    const rootFiles = /^\/(?:|index\.(?:html?|php|asp(x)?)|default\.(?:asp(x)?))$/i
    const bcp47Regex = /^\/([a-z]{2,3})([-_][A-Z]{2})?\/?$/;

    if (pathname === "/") {
        return true
    } else if (bcp47Regex.test(pathname)) {
        return true
    } else if (rootFiles.test(pathname)) {
        return true
    }

    for (let i = 0; i < languageSuffixes.length; i += 1) {
        if (`/${languageSuffixes[i]}` === pathname) {
            return true
        }
    }
    return false
}