<template>
  <v-row justify="center" align="center" class="fill-height">
    <v-col cols="12" class="text-sm-center">
      <v-chip color="green">
        Vous avez été correctement déconnecté, vous allez être rediriger sous peu vers la page de connexion
      </v-chip>
    </v-col>
    <v-col cols="12" class="text-sm-center">
      <v-btn :to="{name: 'security-login'}">Connexion</v-btn>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { auth } from '@/store/modules'

@Component({})
export default class Login extends Vue {

  async mounted () {
    await auth.logout()

    setTimeout(async () => {
      await this.$router.push({ name: 'security-login' })
    }, 5000)
  }
}
</script>

<style lang="scss" scoped>
.row::v-deep {
  &.fill-height {
    height: calc(100vh - 64px - 48px - 24px)
  }
}
</style>
