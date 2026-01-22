
import { Group } from '@visx/group';
import { BoxPlot } from '@visx/stats';
import { scaleBand, scaleLinear } from '@visx/scale';



export default function VisxBoxPlot9010({
    width,
    height,
    data,
    markerValue,
    locTxt
}: BoxPlot9010Stats & { locTxt: Record<string, any> }) {
    const xMax = width;
    const yMax = height - 100;
    const d = data

    const xScale = scaleBand<string>({
        range: [0, xMax],
        round: true,
        padding: 0.4,
    });

    const minYValue = Math.min(d.p10, markerValue) * 0.9;
    const maxYValue = Math.max(d.p90, markerValue) * 1.1;

    const yScale = scaleLinear<number>({
        range: [yMax, 0],
        round: true,
        domain: [minYValue, maxYValue],
    });

    const boxWidth = xScale.bandwidth();
    const constrainedWidth = Math.min(100, boxWidth);


    return width < 10 ? null : (
        <svg width={width} height={height}
            className='bg-white/50 dark:bg-black/50 ring ring-neutral-200 dark:ring-neutral-800 w-full sm:w-auto sm:h-auto'
            aria-label={locTxt?.aria_labels_and_titles?.http_archive_comparison?.aria_label}
        >
            <title>{locTxt?.aria_labels_and_titles?.http_archive_comparison?.title}</title>
            <Group top={30} >
                <g>
                    {markerValue !== undefined && (
                        <g>
                            <rect
                                y={yScale(markerValue) - 5}
                                x={constrainedWidth * 1.5}
                                className='fill-neutral-500'
                                width={10}
                                height={10}
                            />
                            <text
                                fontFamily="'Ubuntu Sans Mono', monospace"
                                className='fill-neutral-950 dark:fill-neutral-50'
                                y={yScale(markerValue) - 12}
                                x={(constrainedWidth * 1.5) - 2}
                            >{markerValue}</text>
                            <rect
                                y={yScale(markerValue)}
                                x={(0.3 * constrainedWidth)}
                                className='fill-neutral-300 dark:fill-neutral-700'
                                width={(constrainedWidth * 1.5) - 40}
                                height={1}
                            />
                        </g>
                    )}

                    <BoxPlot
                        min={data.p10}
                        max={data.p90}
                        firstQuartile={data.p25}
                        thirdQuartile={data.p75}
                        left={(0.3 * constrainedWidth)}
                        median={data.p50}
                        boxWidth={constrainedWidth * 0.4}
                        className='stroke-neutral-600 fill-neutral-200 dark:stroke-neutral-400 dark:fill-neutral-800'
                        fillOpacity={0.3}
                        strokeWidth={1}
                        valueScale={yScale}
                    />
                </g>
            </Group>
        </svg>
    );
};