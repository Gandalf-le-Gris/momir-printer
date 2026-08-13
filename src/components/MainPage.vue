<template>
  <v-container class="fill-height">
    <v-responsive
      class="align-centerfill-height mx-auto"
      max-width-sm="1080"
    >
      <h1 class="text-center mb-10">
        Momir Printer
      </h1>
      <v-row
        dense
        class="justify-center mb-6"
      >
        <v-col
          v-for="i in manaValues"
          :key="i"
          cols="auto"
        >
          <v-btn
            :text="i"
            icon
            @click="loadNewCard(i)"
          />
        </v-col>
      </v-row>

      <div
        v-if="currentCard"
        class="d-flex flex-column"
      >
        <v-img
          :src="currentCard.image_uris.png ?? currentCard.image_uris.large ?? currentCard.image_uris.normal ?? currentCard.image_uris.small"
          max-height="500"
        />
        <v-row
          dense
          class="mt-4 mx-auto"
          style="max-width: 500px;"
        >
          <v-col class="text-h5">
            {{ currentCard.printed_name ?? currentCard.name }}
          </v-col>
          <v-col cols="auto" class="text-h6">
            <MtgText :text="currentCard.mana_cost" />
          </v-col>
          <v-col cols="12" class="font-weight-bold">
            {{ currentCard.printed_type_line ?? currentCard.type_line }}
          </v-col>
          <v-col cols="12" class="text-pre-wrap">
            <MtgText :text="currentCard.printed_text ?? currentCard.oracle_text" />
          </v-col>
          <v-col></v-col>
          <v-col cols="auto" class="text-h6">
            {{ currentCard.power }} / {{ currentCard.toughness }}
          </v-col>
        </v-row>
        <div
          v-if="printerService.status.value === 'connected'"
          class="mx-auto my-4"
        >
          <v-btn
            text="Imprimer"
            prepend-icon="mdi-printer"
            @click="printCard"
          />
        </div>
      </div>
      <v-skeleton-loader
        v-else-if="loading"
        type="card"
        width="300"
        class="mx-auto"
      />
      <h2
        v-else
        class="text-center mt-10"
      >
        Aucune carte à afficher
      </h2>
    </v-responsive>

  </v-container>

  <v-menu
    v-model="showSettings"
    :close-on-content-click="false"
  >
    <template v-slot:activator="{ props }">
      <v-btn
        icon="mdi-cog"
        v-bind="props"
        variant="plain"
        style="position: absolute; top: 12px; right: 8px"
      />
    </template>
    <v-card
      min-width="300"
    >
      <v-card-text>
        <v-row
          dense
          align="center"
        >
          <v-col cols="12">
            <v-select
              label="Langue"
              v-model="language"
              :items="languages"
              item-value="value"
              item-title="text"
              variant="outlined"
              hide-details
            />
          </v-col>
          <v-col cols="12">
            <v-checkbox
              label="Impression automatique"
              v-model="autoPrint"
              hide-details
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-menu>

  <v-btn
    :icon="printerIcon"
    variant="plain"
    style="position: absolute; top: 12px; right: 44px"
    @click="printerService.connect"
  />
</template>

<script setup lang="ts">
import scryfallApi from '@/api/scryfallApi';
import { Card } from '@/types/Card';
import { computed, ComputedRef, Ref, ref } from 'vue';
import printerService from '@/services/printerService';
import { createCardCanvas } from '@/services/canvasDrawer';

const currentCard: Ref<Card | null> = ref(null);
const manaValues: Ref<number[]> = ref(Array.from({ length: 17 }, (_, i) => i));
const showSettings: Ref<boolean> = ref(false);
const languages: Ref<{ value: string, text: string }[]> = ref([
  { value: 'en', text: 'Anglais' },
  { value: 'fr', text: 'Français' },
]);
const language: Ref<string> = ref('en');
const autoPrint: Ref<boolean> = ref(false);
const loading: Ref<boolean> = ref(false);

async function loadNewCard(mv: number) {
  try {
    loading.value = true;
    currentCard.value = await scryfallApi.getRandomCard({ t: "creature", mv, lang: language.value });
    if (autoPrint.value) {
      await printCard();
    }
  } catch {
    currentCard.value = null;
  } finally {
    loading.value = false;
  }
}

async function printCard() {
  if (currentCard.value) {
    const canvas = await createCardCanvas({ card: currentCard.value });
    printerService.printCanvas(canvas);
  }
}

const printerIcon: ComputedRef<string> = computed(() => {
  switch(printerService.status.value) {
    case 'connected': 
      return 'mdi-printer-check';
    case 'connecting':
      return 'mdi-bluetooth-connect';
    case 'not_connected':
      return 'mdi-printer-off';
  }
});
</script>
