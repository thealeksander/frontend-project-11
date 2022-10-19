import _ from 'lodash';
import * as yup from 'yup';
import onChange from 'on-change';
import { getLinks, saveLink } from './server';
import { renderErrors, handleProcessState } from './render';

const schema = yup.object().shape({
  rss: yup.string().trim().required().url().oneOf(getLinks(), 'RSS уже существует'),
});

const validate = (fields) => {
	try {
		schema.validateSync(fields, { abortEarly: false });
		return {};
	} catch (e) {
		return _.keyBy(e.inner, 'path');
	}
};

export default () => {
	const elements = {
		form: document.querySelector('.rss-form'),
		fields: {
			rss: document.querySelector('#url-input'),
		},
		submitButton: document.querySelector('#submit'),
	};

	const state = onChange({
		searсh: {
			mode: 'filling',
			valid: true,
			data: {},
			errors: {},
		},
	}, (path, value, prevValue) => {
		// console.log(path);
		switch (path) {
			// case 'searсh.valid':
			// 	elements.submitButton.disabled = !value;
			// 	break;
			case 'searсh.errors':
				renderErrors(elements, value, prevValue);
				break;
			case 'search.mode':
				handleProcessState(elements, value);
				break;
			default:
				break;
		}
	});

	Object.entries(elements.fields).forEach(([fieldName, fieldElement]) => {
		fieldElement.addEventListener('input', (event) => {
			const { value } = event.target;
			state.searсh.data[fieldName] = value;
		});
	});

	elements.form.addEventListener('submit', (event) => {
		event.preventDefault();

		const error = validate(state.searсh.data);
		state.searсh.errors = error;
		state.searсh.valid = _.isEmpty(error);
		if (!state.searсh.valid) {
			return false;
		}

		state.searсh.mode = 'sending';
		saveLink(state.searсh.data.rss);
		state.searсh.mode = 'sent';
	});
};
