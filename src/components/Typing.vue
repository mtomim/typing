<template>
  <v-container>
    <div>
      <v-row>
        <h1 v-if="userName">Bonjour {{ userName }} !</h1>
        <h1 v-if="!userName">
          Bienvenue ! Comment t'appelles-tu ?
          <v-text-field
            prepend-icon="mdi-account-circle"
            outlined
            label="Login"
            placeholder="mets ton nom ici !"
            @keyup.enter="setUserName"
          />
        </h1>
      </v-row>
      <article>
        <section>
          <v-row>
            <v-col cols="4">
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-text-field
                    prepend-icon="mdi-chat-processing"
                    outlined
                    label="Phrase à taper"
                    placeholder="une autre phrase ?"
                    v-on="on"
                    @keyup.enter="add"
                  />
                </template>
                <span
                  >À la fin, tape <v-icon>mdi-keyboard-return</v-icon> (entrer) !</span
                >
              </v-tooltip>
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-text-field
                    prepend-icon="mdi-label"
                    outlined
                    label="Nommer la liste"
                    placeholder="nom de la liste ?"
                    @keyup.enter="localSaveHandler()"
                    v-on="on"
                    v-model="listName"
                  />
                </template>
                <span
                  >À la fin, tape <v-icon>mdi-keyboard-return</v-icon> (entrer) !</span
                >
              </v-tooltip>
              <v-btn
                @click="
                  phrases = [];
                  listName = '';
                  adding = '';
                "
              >
                Créer une nouvelle collection
              </v-btn>
            </v-col>
            <v-col cols="8">
              <v-container>
                <v-row>
                  <v-card
                    outlined
                    class="phrase mx-auto"
                    max-width="350"
                    tile
                    raised
                    v-for="(phrase, idx) in phrasesToDisplay"
                    :key="idx + phrase"
                    >{{ phrase }}</v-card
                  >
                </v-row>
              </v-container>
            </v-col>
          </v-row>
        </section>
        <section>
          <v-row align="center">
            <v-col cols="3">
              <v-btn outlined @click="newGame" color="primary"
                >démarrer !</v-btn
              >
              <v-btn outlined @click="game.reset();currentPhrase='';" color="primary"
                >abandonner !</v-btn
              >
            </v-col>
            <v-col cols="9">
              <v-row v-if="currentPhrase.length" justify="center">
                <v-card
                  filled
                  color="primary"
                  class="phrase display-2"
                  raised
                  dark
                >
                  {{ currentPhrase }}
                </v-card>
              </v-row>
              <v-row>
                <v-text-field
                  :prepend-icon="currentStatus"
                  outlined
                  v-model="game.typed"
                  ref="typingField"
                  @click.stop="newGameReady && newGame()"
                  @keyup.enter.stop="newGameReady && newGame()"
                  @keyup="handleTyping"
                />
              </v-row>
            </v-col>
          </v-row>
          <v-row align="center">
            <v-col cols="3">
              <v-chip outlined>
                <v-icon left>mdi-speedometer</v-icon>
                {{
                  new Intl.NumberFormat("fr-FR", {
                    maximumFractionDigits: 2
                  }).format(game.average)
                }}
                mots/minute</v-chip
              >
            </v-col>
            <v-col cols="9">
              <v-sparkline
                v-if="averageHistory.length > 1"
                :value="averageHistory"
                :gradient="gradient"
                smooth="10"
                padding="3"
                line-width="2"
                stroke-linecap="round"
                gradient-direction="top"
                :fill="false"
                type="trend"
                :auto-line-width="false"
                auto-draw
              ></v-sparkline>
            </v-col>
          </v-row>
        </section>
      </article>
      <nav>
        <v-row>
          <v-menu offset-y>
            <template v-slot:activator="{ on }">
              <v-btn color="primary" v-on="on">
                <v-icon dark left>mdi-menu</v-icon>
                Collections sauvegardées
              </v-btn>
            </template>
            <v-list>
              <v-list-item
                v-for="(item, index) in phraseList"
                :key="index"
                @click="load(item)"
              >
                <v-list-item-title>
                  <v-icon left>mdi-import</v-icon>
                  {{ item.name }}</v-list-item-title
                >
              </v-list-item>
              <v-list-item @click="exportFile">
                <v-list-item-title>
                  <v-icon left>mdi-export</v-icon>
                  Exporter...</v-list-item-title
                >
              </v-list-item>
              <v-list-item>
                <v-list-item-title>
                  <v-file-input
                    prepend-icon="mdi-file-import"
                    label="Charger depuis un fichier..."
                    @change="loadFile"
                  ></v-file-input>
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-row>
      </nav>
      <aside>
        <div class="ok-words">
          <v-container>
            <v-row justify="space-around">
              <v-card
                color="success"
                v-for="(p, i) in game.finished"
                :key="i + p"
                >{{ p }}</v-card
              >
            </v-row>
          </v-container>
        </div>
        <div class="ko-words">
          <v-container>
            <v-row justify="space-around">
              <v-card
                tile
                raised
                v-for="(p, i) in reverseFailures"
                :key="i + p"
              >
                <span
                  v-for="(part, i) in diff.diffChars(
                    p[0].substring(0, p[1].length).slice(-20),
                    p[1].slice(-20)
                  )"
                  :key="i"
                  :class="part.added || part.deleted ? 'red bad' : 'yellow'"
                  >{{ part.value }}</span
                >
              </v-card>
            </v-row>
          </v-container>
        </div>
      </aside>
    </div>
  </v-container>
</template>
<script>
const format = require("date-format");
const diff = require("diff");
const keyMarker = "-phrase-list-";
const dateFormat = "yyyy-MM-dd-hhmmss";

export default {
  name: "Typing",
  props: {
    msg: String
  },
  data: () => ({
    adding: "",
    listName: "",
    userName: "",
    phrases: [],
    currentPhrase: "",
    phraseList: [],
    gradient: ["teal", "#ff5"],
    averageHistory: [],
    game: {
      original: [],
      list: [],
      finished: [],
      failed: [],
      started: 0,
      ended: 0,
      average: 0,
      typed: "",
      running: function() {
        return !!this.started && !this.ended;
      },
      reset: function() {
        (this.original = []),
          (this.list = []),
          (this.finished = []),
          (this.failed = []),
          (this.started = 0),
          (this.ended = 0),
          (this.average = 0),
          (this.typed = "");
      }
    },
    diff: diff
  }),
  mounted: function() {
    this.userName = localStorage.getItem("userName");
    const list = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.includes(keyMarker)) {
        list.push({
          list: JSON.parse(localStorage.getItem(key)),
          name: key.substring(0, key.indexOf(keyMarker)),
          date: format.parse(
            dateFormat,
            key.substring(key.indexOf(keyMarker) + keyMarker.length)
          ),
          key: key
        });
      }
    }
    this.phraseList.push(...list);
    this.averageHistory.push(
      ...(JSON.parse(localStorage.getItem("averageHistory")) || [])
    );
  },
  computed: {
    currentStatus() {
      return this.currentPhrase.startsWith(this.game.typed)
        ? "mdi-emoticon-cool"
        : "mdi-emoticon-cry";
    },
    phrasesToDisplay() {
      return this.currentPhrase ? this.game.list : this.phrases;
    },
    reverseFailures() {
      return [...this.game.failed].reverse();
    },
    newGameReady() {
      return this.phrases.length > 0 && !this.game.running();
    }
  },
  watch: {
    phraseList: {
      handler: function(current, old) {
        current
          .filter(c => !old.includes(c))
          .forEach(list =>
            localStorage.setItem(list.key, JSON.stringify(list.list))
          );
        old
          .filter(o => !current.includes(o))
          .forEach(o => localStorage.removeItem(o.key));
      },
      deep: true
    },
    averageHistory: function() {
      localStorage.setItem(
        "averageHistory",
        JSON.stringify(this.averageHistory)
      );
    }
  },
  methods: {
    localSaveHandler() {
      const date = new Date();
      const suffix = format.asString(dateFormat, date);
      const listFinalName = `${this.listName}${keyMarker}${suffix}`;
      this.phraseList = this.phraseList.filter(l => l.name !== this.listName);
      this.phraseList.push({
        list: [...this.phrases],
        key: listFinalName,
        date: date,
        name: this.listName
      });
    },
    load(list) {
      this.phrases = [...list.list];
      this.listName = list.name;
    },
    setUserName(event) {
      if (event) {
        this.userName = event.target.value;
        localStorage.setItem("userName", this.userName);
      }
    },
    add() {
      this.phrases.push(this.adding);
      this.adding = "";
    },
    newGame() {
      this.game.reset();
      this.game.original = this.phrases;
      this.game.list.push(...this.game.original);
      this.game.started = new Date().getTime();
      this.game.typed = "";
      this.$refs.typingField.focus();
      this.start();
    },
    start() {
      if (this.game.list.length) {
        this.currentPhrase = this.game.list.shift();
      } else {
        this.currentPhrase = "";
        this.game.ended = new Date().getTime();
        console.log("this.game.finished", this.game.finished);
        if (this.game.finished.join() !== "") {
          const wordsCount = this.game.original.join(" ").split(/[ ,'"]/)
            .length;
          this.game.average =
            (60000 * wordsCount) / (this.game.ended - this.game.started);
          this.averageHistory.push(this.game.average);
        }
      }
    },
    handleTyping() {
      if (this.game.ended) {
        return;
      }
      if (this.game.typed === this.currentPhrase) {
        this.next();
      }
      if (!this.currentPhrase.startsWith(this.game.typed)) {
        this.game.failed.push([this.currentPhrase, this.game.typed]);
      }
    },
    next() {
      this.endCurrent();
      this.start();
    },
    endCurrent() {
      this.game.finished.push(this.currentPhrase);
      this.game.typed = "";
    },
    exportFile() {
      const link = document.createElement("a");
      link.setAttribute(
        "href",
        "data:application/json;charset=utf-8," +
          encodeURIComponent(JSON.stringify(this.phraseList))
      );
      link.setAttribute(
        "download",
        `export-${format(dateFormat, new Date())}.json`
      );
      link.click();
    },
    loadFile(file) {
      if (!file) {
        return;
      }
      const reader = new FileReader(file);
      const vm = this;
      reader.onloadend = function() {
        const data = reader.result;
        const parsed = JSON.parse(data);
        const comingNames = parsed.map(p => p.name);
        vm.phraseList = vm.phraseList.filter(
          p => !comingNames.includes(p.name)
        );
        parsed.forEach(pl => {
          vm.phraseList.push(pl);
        });
      };
      reader.readAsText(file, "utf-8");
    }
  }
};
</script>
<style scoped>
.v-btn.phrase {
  text-transform: none;
}
.ko-words {
  font-family: "Courier New", Courier, monospace;
}
.red.bad {
  position: absolute;
  transform: translateX(-100%);
  background-color: rgba(255, 0, 0, 0.308) !important;
  color: rgba(255, 0, 0, 0.6) !important;
  font-style: italic;
}
</style>
