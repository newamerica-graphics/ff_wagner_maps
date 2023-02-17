import customLeafletMap from './customLeafletMap'
import './index.scss'

let queue = []
let data = null

const settings = {
  map_individuals: el => {
    customLeafletMap(
      el,
      data.individuals,
      'vk_group',
      'Locations of Group Members',
      'The self-reported locations of members of the PMC Wagner-Military Review, Rusich, and Russian Imperial Movement groups on VKontakte.',
      (d) => `
        ${(d.city_title || d.country_title)
          ? `<dt>Location</dd><dd class="comma-list"><span>${d.city_title}</span><span>${d.country_title}</span></dd>`
          : ''}
        ${d.full_unit_affiliation_english
          ? `<dt>Unit Affiliation</dt><dd>${d.full_unit_affiliation_english}</dd>`
          : ''}
        ${d.sex
          ? `<dt>Sex</dt><dd>${d.sex}</dd>`
          : ''}
        ${d.occupation_type
          ? `<dt>Occupation Type</dt><dd>${d.occupation_type}</dd>`
          : ''}
        ${d.personal_alcohol
          ? `<dt>Personal Alcohol</dt><dd>${d.personal_alcohol}</dd>`
          : ''}
        ${d.personal_political
          ? `<dt>Personal Political</dt><dd>${d.personal_political}</dd>`
          : ''}
        ${d.personal_religion
          ? `<dt>Personal Religion</dt><dd>${d.personal_religion}</dd>`
          : ''}
      `
    )
  },
  map_units: el => {
    customLeafletMap(
      el,
      data.units,
      'vk_group',
      'Locations of Military Units ',
      'The locations of existing and historical military units in which members of the PMC Wagner-Military Review, Rusich, and Russian Imperial Movement groups on VKontakte claim to have served. Note that unit locations are based on open source information and may contain errors. Please send comments or corrections to <a href="mailto:futurefrontlines@newamerica.org">futurefrontlines@newamerica.org</a>.',
      (d) => `
        ${d.existence ? `<em class="tooltip__single-item">${d.existence}</em>` : ''}
        ${(d.location_english || d.location_russian)
          ? `<dt>Location</dt><dd>${d.location_english}</dd>`
          : ''}
        ${(d.full_unit_affiliation_english || d.full_unit_affiliation_russian)
          ? `<dt>Unit Affiliation</dt><dd>${d.full_unit_affiliation_english}</dd>`
          : ''}
      `
    )
  }
}

fetch('https://na-data-sheetsstorm.s3.us-west-2.amazonaws.com/prod/ff/wagner-maps.json').then(response => response.json()).then((_data)=>{
  data = _data
  for(let i=0; i<queue.length; i++)
    queue[i]()
})

window.renderDataViz = function(el){
  let id = el.getAttribute('id')
  let chart = settings[id]
  if(!chart) return

  if(data){
    chart(el)
  } else {
    queue.push(() => chart(el))
  }
}
