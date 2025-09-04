import { mount } from '@vue/test-utils';
import Link from '../Link.vue';

describe('Link', () => {
  it('prefixes https when external path lacks protocol', () => {
    const wrapper = mount(Link, {
      props: {
        external: true,
        path: 'www.amazon.co.uk/dp/B06XSLGTC5',
      },
    });

    const anchor = wrapper.find('a');
    expect(anchor.attributes('href')).toBe('https://www.amazon.co.uk/dp/B06XSLGTC5');
  });
});

