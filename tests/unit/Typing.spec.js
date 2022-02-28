import { mount, createLocalVue } from '@vue/test-utils'
import Typing from '@/components/Typing.vue'
import Vuetify from 'vuetify';

describe('Typing.vue', () => {
  class LocalStorageMock {
    constructor() {
      this.store = {};
    }
  
    clear() {
      this.store = {};
    }
  
    getItem(key) {
      return this.store[key] || null;
    }
  
    setItem(key, value) {
      this.store[key] = String(value);
    }
  
    removeItem(key) {
      delete this.store[key];
    }
  }
  
  global.localStorage = new LocalStorageMock;

  const localVue = createLocalVue()

  let vuetify;

  beforeEach(() => {
    vuetify = new Vuetify();
    localStorage.clear()
  })

  it('has mounted method to obtain data property `userName`', () => {
    localStorage.setItem('userName', "testing user name")
    const wrapper = mount(Typing, {
      localVue,
      vuetify
    })
    expect(wrapper.vm.$data.userName).toBe("testing user name");
  })

  it('has mounted method to obtain phraseList and averageHistory data', () => {
    localStorage.setItem('empty-phrase-list-a-date', JSON.stringify([]));
    const wrapper = mount(Typing, {
      localVue,
      vuetify
    })
    expect(JSON.stringify(wrapper.vm.$data.phraseList[0].list)).toBe(JSON.stringify([]));
    expect(wrapper.vm.$data.phraseList[0].name).toBe("empty")
    expect(wrapper.vm.$data.phraseList[0].date).toBe("a-date")
    expect(wrapper.vm.$data.phraseList[0].key).toBe('empty-phrase-list-a-date')
    expect(wrapper.vm.$data.averageHistory.length).toBe(0);
  })
})
