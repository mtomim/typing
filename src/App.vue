<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-icon dark left right>mdi-emoticon-cool</v-icon> Apprends à taper sur le
      clavier d'ordi !
    </v-app-bar>

    <v-content>
      <Typing />
    </v-content>
  </v-app>
</template>

<script>
import Typing from "./components/Typing";

export default {
  name: "App",

  components: {
    Typing
  },

  data: () => ({
    //
  })
};
</script>
