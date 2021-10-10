<template>
  <v-container>
    <v-row justify="end">
      <v-card
        v-for="(phrase, idx) in phrases"
        :key="idx + phrase"
        class="phrase mx-auto pa-0 pl-1"
        tile
        raised
        outlined
      >
        {{ phrase }}
        <v-btn icon text color="red-grey">
          <v-icon @click="$emit('pull-phrase', phrase)">mdi-pencil</v-icon>
        </v-btn>
      </v-card>
    </v-row>
  </v-container>
</template>
<script>
export default {
  props: {
    phrases: Array,
  },
};
</script>
