import { defineStore } from 'pinia';
import apolloClient from '../../../apollo-client';
import appSetting from './../../app-setting';
import { languagesQuery } from '../api/queries/languages.js';
import { DEFAULT_LANGUAGE } from '../utils/constants'

interface Language {
  name: string;
  code: string;
  bidi: boolean;
  nameLocal: string;
  nameTranslated: string;
}

export const useAppStore = defineStore('app', {
    state: () => ({
        isDarkMode: false,
        mainLayout: 'app',
        theme: 'light',
        menu: 'vertical',
        layout: 'full',
        animation: '',
        navbar: 'navbar-sticky',
        locale: localStorage.getItem('i18n_locale') || DEFAULT_LANGUAGE.code,
        sidebar: false,
        expireLanguageList: null ,
        languageList: [] as Language[],
        rtlClass: 'ltr',
        isShowMainLoader: true,
        semidark: false,
        searchConfig: null,
    }),

    actions: {
        async fetchLanguages() {
          let expireLanguageList: string | null = localStorage.getItem('expireLanguageList');
          let expireLanguageListDate: Date | null = expireLanguageList ? new Date(expireLanguageList) : null;

          if (!expireLanguageListDate || new Date() > expireLanguageListDate) {
            const { data } = await apolloClient.query({
              query: languagesQuery,
            });

            if (data && data.languages) {
              this.languageList = data.languages as Language[];
              localStorage.setItem('languageList', JSON.stringify(data.languages));

              const newExpireDate = new Date(new Date().getTime() + (24 * 60 * 60 * 1000));
              localStorage.setItem('expireLanguageList', newExpireDate.toISOString());
            }
          } else {
            const storedLanguages = localStorage.getItem('languageList');
            this.languageList = storedLanguages ? JSON.parse(storedLanguages) as Language[] : [];
          }
        },
    updateRTLClass(bidi: boolean) {
      this.rtlClass = bidi ? 'rtl' : 'ltr';
    },
        setMainLayout(payload: any = null) {
            this.mainLayout = payload; //app , auth
        },
        toggleTheme(payload: any = null) {
            payload = payload || this.theme; // light|dark|system
            localStorage.setItem('theme', payload);
            this.theme = payload;
            if (payload == 'light') {
                this.isDarkMode = false;
            } else if (payload == 'dark') {
                this.isDarkMode = true;
            } else if (payload == 'system') {
                if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    this.isDarkMode = true;
                } else {
                    this.isDarkMode = false;
                }
            }

            if (this.isDarkMode) {
                document.querySelector('body')?.classList.add('dark');
            } else {
                document.querySelector('body')?.classList.remove('dark');
            }
        },
        toggleMenu(payload: any = null) {
            payload = payload || this.menu; // vertical, collapsible-vertical, horizontal
            this.sidebar = false; // reset sidebar state
            localStorage.setItem('menu', payload);
            this.menu = payload;
        },
        toggleLayout(payload: any = null) {
            payload = payload || this.layout; // full, boxed-layout
            localStorage.setItem('layout', payload);
            this.layout = payload;
        },
        toggleAnimation(payload: any = null) {
            payload = payload || this.animation; // animate__fadeIn, animate__fadeInDown, animate__fadeInUp, animate__fadeInLeft, animate__fadeInRight, animate__slideInDown, animate__slideInLeft, animate__slideInRight, animate__zoomIn
            payload = payload?.trim();
            localStorage.setItem('animation', payload);
            this.animation = payload;
            appSetting.changeAnimation();
        },
        toggleNavbar(payload: any = null) {
            payload = payload || this.navbar; // navbar-sticky, navbar-floating, navbar-static
            localStorage.setItem('navbar', payload);
            this.navbar = payload;
        },
        toggleSemidark(payload: any = null) {
            payload = payload || false;
            localStorage.setItem('semidark', payload);
            this.semidark = payload;
        },
        toggleRTL(bidi: boolean) {
          const rtlClass = bidi ? 'rtl' : 'ltr';
          localStorage.setItem('rtlClass', rtlClass);
          this.rtlClass = rtlClass;
          document.querySelector('html')?.setAttribute('dir', rtlClass);
        },

        toggleLocale(languageCode: string) {
          localStorage.setItem('i18n_locale', languageCode);
          this.locale = languageCode;

          // @ts-ignore
          const language = this.languageList.find(lang => lang.code === languageCode);
          // @ts-ignore
          const isRTL = language ? language.bidi : false;
          this.toggleRTL(isRTL);
        },
        toggleSidebar(state: boolean = false) {
            this.sidebar = !this.sidebar;
        },
        toggleMainLoader(state: boolean = false) {
            this.isShowMainLoader = true;
            setTimeout(() => {
                this.isShowMainLoader = false;
            }, 500);
        },
        setSearchConfig(newConfig) {
            this.searchConfig = newConfig;
        },

        resetSearchConfig() {
            this.searchConfig = null; // Reset to no configuration
        },
    },
    getters: {},
});
