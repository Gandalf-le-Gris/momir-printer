<template>
  <div class="mtg-text text-pre-wrap">
    <template v-for="(part, index) in parsedText" :key="index">
      <img
        v-if="part.isSymbol"
        :src="getSymbolUrl(part.value)"
        :alt="part.value"
        class="mtg-symbol"
      />
      <span v-else>{{ part.value }}</span>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  text: string;
}>();

const parsedText = computed(() => {
  if (!props.text) return [];
  
  const regex = /(\{[^{}]+\})/g;
  const parts = props.text.split(regex);

  return parts.map(part => ({
    value: part,
    isSymbol: regex.test(part)
  }));
});

const getSymbolUrl = (rawSymbol: string): string => {
  const cleanSymbol = rawSymbol
    .replace(/[{}]/g, '')
    .replace(/\//g, '');
    
  return `https://svgs.scryfall.io/card-symbols/${cleanSymbol}.svg`;
};
</script>

<style scoped>
.mtg-text {
  line-height: 1.6;
}

.mtg-symbol {
  display: inline-block;
  height: 1.1em;
  width: 1.1em;
  vertical-align: -0.15em;
  margin: 0 0.07em;
}
</style>
