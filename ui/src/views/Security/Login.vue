<template>
  <v-row justify="center" align="center" class="fill-height">
    <v-form @submit.prevent="login" v-if="!success">
      <v-col cols="12" v-if="error.length > 0" class="text-sm-center">
        <v-chip color="red">{{ error }}</v-chip>
      </v-col>
      <v-col cols="12">
        <v-text-field v-model="username"
                      label="Identifiant"
                      :disabled="loading"/>
      </v-col>
      <v-col cols="12">
        <v-text-field v-model="password"
                      label="Mot de passe"
                      :disabled="loading"
                      :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                      @click:append="showPassword = !showPassword"
                      :type="showPassword ? 'text' : 'password'"/>
      </v-col>
      <v-col cols="12" class="text-sm-right">
        <v-btn type="submit" :loading="loading">Connexion</v-btn>
      </v-col>
    </v-form>
    <template v-else>
      <v-col cols="12" class="text-sm-center">
        <v-chip color="green">
          Vous avez été correctement identifié
        </v-chip>
      </v-col>
      <v-col cols="12" class="text-sm-center">
        <v-btn :to="{name: 'image-list'}">Accueil</v-btn>
      </v-col>
    </template>
  </v-row>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import AuthentificationApi from '@/service/api/AuthentificationApi'
import { auth } from '@/store/modules'

@Component({})
export default class Login extends Vue {
  username: string = ''
  password: string = ''

  error: string = ''

  loading: boolean = false
  success: boolean = false
  showPassword: boolean = false

  mounted () {
    if (auth.authenticated) {
      this.$router.push('/')
    }
  }

  async login () {
    let result
    this.error = ''
    this.success = false
    try {
      result = await AuthentificationApi.login(this.username, this.password)
      await auth.login(result.data.access_token)
      this.success = true

      setTimeout(async () => {
        await this.$router.push({ name: 'image-list' })
      }, 5000)
    } catch (e) {
      this.error = 'Couple identifiant/mot de passe invalide'
    }
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
