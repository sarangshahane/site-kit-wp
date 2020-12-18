/**
 * GoogleChart component.
 *
 * Site Kit by Google, Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * External dependencies
 */
import debounce from 'lodash/debounce';
import PropTypes from 'prop-types';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useEffect, useState, useRef } from '@wordpress/element';

/**
 * Internal dependencies
 */
import ProgressBar from './ProgressBar';

export default function GoogleChart( props ) {
	const {
		chartType,
		className,
		children,
		data,
		loadCompressed,
		loadHeight,
		loadSmall,
		loadText,
		onReady,
		options,
		selectedStats,
		singleStat,
	} = props;

	const chartRef = useRef( null );
	const [ chart, setChart ] = useState( null );
	const [ loading, setLoading ] = useState( true );
	const [ visualizationLoaded, setVisualizationLoaded ] = useState( false );

	// Create a new chart when the library is loaded.
	useEffect( () => {
		if ( ! chart && ! loading && chartRef.current && visualizationLoaded ) {
			const googleChart = 'pie' === chartType
				? new global.google.visualization.PieChart( chartRef.current )
				: new global.google.visualization.LineChart( chartRef.current );

			if ( onReady ) {
				global.google.visualization.events.addListener( googleChart, 'ready', () => {
					onReady( googleChart );
				} );
			}

			setChart( googleChart );
		}
	}, [ loading, !! chartRef.current, visualizationLoaded, !! chart ] );

	// Draw the chart whenever one of these properties has changed.
	useEffect( () => {
		const drawChart = () => {
			let dataTable = global.google?.visualization?.arrayToDataTable?.( data );
			if ( ! dataTable ) {
				return;
			}

			if ( selectedStats.length > 0 ) {
				const dataView = new global.google.visualization.DataView( dataTable );
				if ( ! singleStat ) {
					dataView.setColumns(
						[ 0, ...selectedStats.map( ( stat ) => stat + 1 ) ]
					);
				}
				dataTable = dataView;
			}

			if ( chart ) {
				chart.draw( dataTable, options );
			}
		};

		const resize = debounce( drawChart, 100 );
		global.addEventListener( 'resize', resize );

		drawChart();

		return () => {
			global.removeEventListener( 'resize', resize );
		};
	}, [
		chart,
		JSON.stringify( data ),
		JSON.stringify( options ),
		selectedStats,
		singleStat,
	] );

	useEffect( () => {
		const interval = setInterval( () => {
			if ( !! global.google?.visualization?.PieChart && !! global.google?.visualization?.LineChart ) {
				clearInterval( interval );
				setLoading( false );
				setVisualizationLoaded( true );
			}
		}, 50 );

		return () => {
			clearInterval( interval );
		};
	}, [] );

	return (
		<div className="googlesitekit-graph-wrapper">
			<div ref={ chartRef } className="googlesitekit-line-chart">
				<div className="googlesitekit-chart-loading">
					{ loading && (
						<div className="googlesitekit-chart-loading__wrapper">
							{ loadText && (
								<p>{ __( 'Loading chart…', 'google-site-kit' ) }</p>
							) }

							<ProgressBar
								className={ className }
								small={ loadSmall }
								compress={ loadCompressed }
								height={ loadHeight }
							/>
						</div>
					) }
				</div>
			</div>

			{ ! loading && (
				children
			) }
		</div>
	);
}

GoogleChart.propTypes = {
	chartType: PropTypes.oneOf( [ 'pie', 'line', '' ] ),
	className: PropTypes.string,
	children: PropTypes.node,
	data: PropTypes.arrayOf( PropTypes.array ),
	loadCompressed: PropTypes.bool,
	loadSmall: PropTypes.bool,
	loadHeight: PropTypes.number,
	loadText: PropTypes.bool,
	onReady: PropTypes.func,
	selectedStats: PropTypes.arrayOf( PropTypes.number ),
	singleStat: PropTypes.bool,
};

GoogleChart.defaultProps = {
	chartType: 'line',
	className: '',
	data: [],
	loadCompressed: false,
	loadSmall: false,
	loadHeight: null,
	loadText: true,
	selectedStats: [],
	singleStat: true,
};
