

export function generateAuditSummary(
    scores: {
        score_main: number,
        score_e: number,
        score_s: number,
        score_o: number,
        score_c: number
    },
    stats: {
        main: ExtendedBoxPlotViolingProps,
        e: ExtendedBoxPlotViolingProps,
        s: ExtendedBoxPlotViolingProps,
        o: ExtendedBoxPlotViolingProps,
        c: ExtendedBoxPlotViolingProps
    },
    template: any
) {
    const evaluate = (score: number, s: ExtendedBoxPlotViolingProps) => {
        // tiers
        let desc = "";
        if (score >= s.p90) desc = template.tiers.top10;
        else if (score >= s.thirdQuartile) desc = template.tiers.top25;
        else if (score >= s.median) desc = template.tiers.top50;
        else if (score >= s.firstQuartile) desc = template.tiers.bottom50;
        else if (score >= s.p10) desc = template.tiers.bottom25;
        else desc = template.tiers.bottom10
        return { desc, score };
    };

    let summaries: { q: string, a: string, key:string }[] = []

    const mapping = [
        { key: 'score_main', statKey: 'main' },
        { key: 'score_e', statKey: 'e' },
        { key: 'score_s', statKey: 's' },
        { key: 'score_o', statKey: 'o' },
        { key: 'score_c', statKey: 'c' }
    ];

    mapping.forEach((m) => {
        const val = scores[m.key as keyof typeof scores];
        const stat = stats[m.statKey as keyof typeof stats];
        const evalResult = evaluate(val, stat);

        const desc = evalResult.desc.replace('{{score}}',
            evalResult.score.toString())

        summaries = [
            ...summaries, 
            { key: m.statKey, 
             a: desc, 
             q: template.questions[m.statKey] }]
    });


    return summaries
}