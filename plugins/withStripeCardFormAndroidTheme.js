const { withAndroidStyles, withMainActivity } = require("@expo/config-plugins");

const MATERIAL_APP_THEME = "Theme.MaterialComponents.DayNight.NoActionBar";
const APP_THEME_NAME = "AppTheme";
const SET_THEME_SNIPPET = "setTheme(R.style.AppTheme);";

function withStripeCardFormAndroidTheme(config) {
  config = withAndroidStyles(config, (modConfig) => {
    const resources = modConfig.modResults.resources ?? {};
    const styles = Array.isArray(resources.style) ? resources.style : [];

    resources.style = styles.map((style) => {
      if (style?.$?.name !== APP_THEME_NAME) {
        return style;
      }

      return {
        ...style,
        $: {
          ...style.$,
          parent: MATERIAL_APP_THEME,
        },
      };
    });

    modConfig.modResults.resources = resources;
    return modConfig;
  });

  config = withMainActivity(config, (modConfig) => {
    if (!modConfig.modResults.contents.includes(`// ${SET_THEME_SNIPPET}`)) {
      return modConfig;
    }

    modConfig.modResults.contents = modConfig.modResults.contents.replace(
      `// ${SET_THEME_SNIPPET}`,
      SET_THEME_SNIPPET,
    );

    return modConfig;
  });

  return config;
}

module.exports = withStripeCardFormAndroidTheme;
