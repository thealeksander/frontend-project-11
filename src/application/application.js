import _ from 'lodash';
import * as yup from 'yup';
import onChange from 'on-change';
import getLinks from './server';

const schema = yup.object.shape({
  rss: yup.string().trim().required().url().oneOf(getLinks(), 'RSS уже существует'),
});

export default () => {
	const elements = {
		form: document.querySelector('.rss-form'),
		filds: {
			rss: document.querySelector('#url-input'),
		}
	};

	const state = onChange({
		searсh: {
			mode: 'filling',
			valid: true,
			data: {},
			errors: {},
		},
	}, (path, value) => {});

	Object.entries(elements.filds).forEach(([fieldName, fieldElement]) => {
		fieldElement.addEventListener('input', (event) => {
			
		});
	});
};
