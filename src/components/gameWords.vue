<template>
  <v-container>
    <v-row justify="end">
      <v-card
        v-for="(phrase, idx) in phrases"
        :key="idx + phrase"
        class="phrase mx-auto pr-2 pt-1"
        tile
        raised
        outlined
      >
        <v-btn icon text color="red-grey">
          <v-icon @click="$emit('pull-phrase', phrase)"
            >mdi-backspace</v-icon
          >
        </v-btn>
        {{ phrase }}
      </v-card>
    </v-row>
  </v-container>
</template>
<script>
export default {
  props: {
    phrases: Array
  }
};
</script>
