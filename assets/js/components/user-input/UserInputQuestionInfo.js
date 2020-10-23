/**
 * User Input Question Info.
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
 * External dependencies
 */
import PropTypes from 'prop-types';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import UserInputQuestionNotice from './UserInputQuestionNotice';

export default function UserInputQuestionInfo( { children } ) {
	return (
		<div className="
			mdc-layout-grid__cell
			mdc-layout-grid__cell--span-5-desktop
			mdc-layout-grid__cell--span-8-tablet
			mdc-layout-grid__cell--span-4-phone
		">

			<h1 className="googlesitekit-user-input__question-title">
				{ children }
			</h1>

			<p className="googlesitekit-user-input__question-instructions">
				{ __( 'Place a text here that gives more context and information to the user to answer the question correctly.', 'google-site-kit' ) }
			</p>

			<UserInputQuestionNotice />
		</div>
	);
}

UserInputQuestionInfo.propTypes = {
	children: PropTypes.string.isRequired,
};
