export default interface _Nomenclature {
  code: string
  label: string
}

export function getNomenclatureLabel (nomenclature: _Nomenclature[], code: string) {
  const items = nomenclature.filter((item: _Nomenclature) => {
    return code === item.code
  })
  if (items.length === 1) {
    return items[0].label
  }
  return ''
}

export const ANALYSIS_STATUS: _Nomenclature[] = [
  {
    code: 'not_analyzed',
    label: 'Pas analysée'
  },
  {
    code: 'analyzing',
    label: 'En cours'
  },
  {
    code: 'analyzed',
    label: 'Analysée'
  },
  {
    code: 'analysis_failed',
    label: 'Échec'
  }
]

export const IMAGE_STATUS: _Nomenclature[] = [
  {
    code: 'active',
    label: 'Active'
  },
  {
    code: 'inactive',
    label: 'Inactive'
  },
  {
    code: 'disabled',
    label: 'Désactivée'
  }
]

export const SUBSCRIPTION_TYPE: _Nomenclature[] = [
  {
    code: 'analysis_update',
    label: 'Analyse'
  },
  {
    code: 'repo_update',
    label: 'Dépôt'
  },
  {
    code: 'policy_eval',
    label: 'Police'
  },
  {
    code: 'tag_update',
    label: 'Tag'
  },
  {
    code: 'vuln_update',
    label: 'Vulnérabilité'
  }
]

export const ACCOUNT_STATE: _Nomenclature[] = [
  {
    code: 'enabled',
    label: 'Actif'
  },
  {
    code: 'disabled',
    label: 'Désactivé'
  },
  {
    code: 'deleting',
    label: 'En cours de suppression'
  }
]

export const ACCOUNT_TYPE: _Nomenclature[] = [
  {
    code: 'user',
    label: 'Utilisateur'
  },
  {
    code: 'admin',
    label: 'Admin'
  },
  {
    code: 'service',
    label: 'Compte de service'
  }
]

export const USER_TYPE: _Nomenclature[] = [
  {
    code: 'native',
    label: 'Natif'
  },
  {
    code: 'internal',
    label: 'Interne'
  },
  {
    code: 'external',
    label: 'Externe'
  }
]