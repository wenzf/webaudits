
import { Group } from '@visx/group';
import { ViolinPlot, BoxPlot } from '@visx/stats';
import { scaleBand, scaleLinear } from '@visx/scale';
import { PatternLines } from '@visx/pattern';
import { useId } from 'react';
import { valueToRgb } from '~/site/utils/colors';

// accessors
const x = (d: ExtendedBoxPlotViolinStats) => d.boxPlot.x;
const median = (d: ExtendedBoxPlotViolinStats) => d.boxPlot.median;
const firstQuartile = (d: ExtendedBoxPlotViolinStats) => d.boxPlot.firstQuartile;
const thirdQuartile = (d: ExtendedBoxPlotViolinStats) => d.boxPlot.thirdQuartile;


export default function VisxViolinPlot({
    width,
    height,
    data,
    markerValue,
    aria_label, title

}: BoxPlotViolinProps & { aria_label: string, title: string }) {
    const xMax = width;
    const yMax = height * .8;
    const d = data

    const uid = useId()

    const violinPatternId = `vp-${uid}`

    const minYValue = markerValue !== undefined ? Math.min(d.boxPlot.min, markerValue) : d.boxPlot.min;
    const maxYValue = markerValue !== undefined ? Math.max(d.boxPlot.max, markerValue) : d.boxPlot.max;

    // scales
    const xScale = scaleBand<string>({
        range: [0, xMax],
        round: true,
        domain: [d].map(x),
        padding: 0.4,
    });

    const yScale = scaleLinear<number>({
        range: [yMax, 0],
        round: true,
        domain: [minYValue, maxYValue],
    });

    const boxWidth = xScale.bandwidth();
    const constrainedWidth = Math.min(100, boxWidth);

    return width < 10 ? null : (
        <svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            className='bg-white/50 dark:bg-black/50 ring ring-neutral-200 dark:ring-neutral-800 w-full h-auto'
            aria-label={aria_label}
        >
            <title>{title}</title>
            <PatternLines
                id={violinPatternId}
                height={6}
                width={3}
                strokeWidth={1}
                orientation={['horizontal']}
                className='stroke-neutral-300 dark:stroke-neutral-700'
            />
            <Group top={30} >
                <g>
                    {markerValue !== undefined && (
                        <g>
                            <rect
                                y={yScale(markerValue) - 5}
                                x={xScale(x(d))! + (constrainedWidth * 1.5) + 20}
                                // className='fill-neutral-500'
                                width={10}
                                height={10}
                                style={{ fill: `rgba(${valueToRgb(markerValue, 0, 100)} / 0.85)` }}
                            />

                            <text
                                fontFamily="'Ubuntu Sans Mono', monospace"
                                className='fill-neutral-950 dark:fill-neutral-50'
                                y={yScale(markerValue) - 12}
                                x={xScale(x(d))! + (constrainedWidth * 1.5) + 17}
                            >{markerValue}</text>

                            <rect
                                y={yScale(markerValue)}
                                x={xScale(x(d))! + 0.3 * constrainedWidth}
                                className='fill-neutral-300 dark:fill-neutral-700'
                                width={constrainedWidth * 1.5 - (0.3 * constrainedWidth)}
                                height={1}
                            />
                        </g>
                    )}

                    <g>
                        <circle
                            cy={yScale(data.boxPlot.mean)}
                            cx={xScale(x(d))! + constrainedWidth + 20}
                            //className='fill-neutral-500'
                            r={5}
                            style={{ fill: `rgba(${valueToRgb(data.boxPlot.mean, 0, 100)} / 0.85)` }}
                        />
                        <text
                            fontFamily="'Ubuntu Sans Mono', monospace"
                            className='fill-neutral-950 dark:fill-neutral-50'
                            y={yScale(data.boxPlot.mean) - 12}
                            x={xScale(x(d))! + (constrainedWidth + 12)}
                        >
                            {data.boxPlot.mean}
                        </text>
                        <rect
                            y={yScale(data.boxPlot.mean)}
                            x={xScale(x(d))! + 0.3 * constrainedWidth}
                            width={constrainedWidth - (+ 0.3 * constrainedWidth)}
                            className='fill-neutral-300 dark:fill-neutral-700'
                            height={1}
                        />
                    </g>

                    <ViolinPlot
                        data={d.binData}
                        className='stroke-neutral-300 dark:stroke-neutral-700'
                        left={xScale(x(d))!}
                        width={constrainedWidth}
                        valueScale={yScale}
                        fill={`url(#${violinPatternId})`}
                    />

                    <BoxPlot
                        min={d.boxPlot.min}
                        max={d.boxPlot.max}
                        left={xScale(x(d))! + 0.3 * constrainedWidth}
                        firstQuartile={firstQuartile(d)}
                        thirdQuartile={thirdQuartile(d)}
                        median={median(d)}
                        boxWidth={constrainedWidth * 0.4}
                        className='stroke-neutral-600 fill-neutral-200 dark:stroke-neutral-400 dark:fill-neutral-800'
                        fillOpacity={0.5}
                        strokeWidth={1}
                        valueScale={yScale}
                    />
                </g>

            </Group>
        </svg>
    );
};