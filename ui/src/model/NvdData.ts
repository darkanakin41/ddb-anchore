export default interface NvdData{
  id: string
  cvss_v2: CVSSV2Scores
  cvss_v3: CVSSV3Scores
}

export interface 	CVSSV2Scores{
  base_score: number
  exploitability_score: number
  impact_score: number
}

export interface 	CVSSV3Scores{
  base_score: number
  exploitability_score: number
  impact_score: number
}