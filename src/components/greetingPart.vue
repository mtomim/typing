<template>
  <v-row>
    <h1 v-if="userName">Bonjour {{ userName }} !</h1>
    <h2 v-if="!userName">
      Bienvenue ! Comment t'appelles-tu ?
      <v-text-field
        prepend-icon="mdi-account-circle"
        outlined
        label="Login"
        placeholder="mets ton nom ici !"
        @keyup.enter="$emit('set-user-name', $event)"
      />
    </h2>
  </v-row>
</template>
<script>
export default {
  props: {
    userName: String
  }
};
</script>
