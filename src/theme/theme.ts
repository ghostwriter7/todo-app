export interface Theme {
  name: string;
  properties: {
    [key: string]: string;
  };
}

export const dark: Theme = {
  name: 'dark',
  properties: {
    '--bg-color': 'hsl(235, 21%, 11%)',
    '--bg-secondary-color': 'hsl(235, 24%, 19%)',
    '--color-text-primary': 'hsl(234, 39%, 85%)',
    '--color-text-hover': 'hsl(236, 33%, 92%)',
    '--color-accent': 'hsl(233, 14%, 35%)',
    '--color-border': 'hsl(237, 14%, 26%)',
    '--background-image': 'url("./assets/img/bg-desktop-dark.jpg")',
    '--background-image-mobile': 'url("./assets/img/bg-mobile-dark.jpg")',
    '--toggle-theme-icon': 'url("./assets/img/icon-sun.svg")',
    '--toggle-theme-anim': 'rotate',
    '--box-shadow': '-5px 10px 15px rgba(0,0,0,.4), 5px 10px 15px rgba(0,0,0,.4)'
  }
}

export const light: Theme = {
  name: 'light',
  properties: {
    '--bg-color': 'hsl(236, 33%, 92%)',
    '--bg-secondary-color': 'hsl(0, 0%, 98%)',
    '--color-text-primary': 'hsl(235, 19%, 35%)',
    '--color-text-hover': 'hsl(235, 24%, 19%)',
    '--color-accent': 'hsl(236, 9%, 61%)',
    '--color-border': 'hsl(233, 11%, 84%)',
    '--background-image': 'url("./assets/img/bg-desktop-light.jpg")',
    '--background-image-mobile': 'url("./assets/img/bg-mobile-light.jpg")',
    '--toggle-theme-icon': 'url("./assets/img/icon-moon.svg")',
    '--toggle-theme-anim': 'grow',
    '--box-shadow': '-2px 2px 7px rgba(236, 236, 236, .6), 2px 2px 7px rgba(236, 236, 236, .6)'
  }
}
