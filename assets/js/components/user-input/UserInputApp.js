/**
 * User Input App.
 *
 * Site Kit by Google, Copyright 2020 Google LLC
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
 * WordPress dependencies
 */
import { Fragment } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import Header from '../header';
import PageHeader from '../page-header';
import UserInputQuestionnaire from './UserInputQuestionnaire';
import { Grid, Row, Cell } from '../../material-components';

export default function UserInputApp() {
	if ( ! featureFlags.userInput.enabled ) {
		return <div>{ __( 'Something went wrong.', 'google-site-kit' ) }</div>;
	}

	return (
		<Fragment>
			<Header />
			<div className="googlesitekit-user-input">
				<div className="googlesitekit-module-page">
					<Grid>
						<Row>
							<Cell lg={ 6 }>
								<PageHeader
									className="googlesitekit-heading-2 googlesitekit-user-input__heading"
									title={ __( 'Customize Site Kit to match your goals', 'google-site-kit' ) }
									fullWidth
								/>
							</Cell>
							<Cell lg={ 6 }>
								<span className="googlesitekit-user-input__subtitle">
									{ __( 'Get metrics and suggestions that are specific to your site by telling Site Kit more about your site', 'google-site-kit' ) }
								</span>
							</Cell>
						</Row>
					</Grid>

					<Grid className="googlesitekit-user-input__content">
						<Row>
							<Cell>
								<UserInputQuestionnaire />
							</Cell>
						</Row>
					</Grid>
				</div>
			</div>
		</Fragment>
	);
}
