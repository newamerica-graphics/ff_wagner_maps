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
      (d) => `
        ${(d.city_title || d.country_title)
          ? `<dt>Location</dd><dd class="comma-list"><span>${d.city_title}</span><span>${d.country_title}</span></dd>`
          : ''}
        ${d.full_unit_affiliation_english
          ? `<dt>Unit affiliation</dt><dd>${d.full_unit_affiliation_english}</dd>`
          : ''}
        ${d.sex
          ? `<dt>Sex</dt><dd>${d.sex}</dd>`
          : ''}
        ${d.occupation_type
          ? `<dt>Occupation type</dt><dd>${d.occupation_type}</dd>`
          : ''}
        ${d.personal_alcohol
          ? `<dt>Personal alcohol</dt><dd>${d.personal_alcohol}</dd>`
          : ''}
        ${d.personal_political
          ? `<dt>Personal political</dt><dd>${d.personal_political}</dd>`
          : ''}
        ${d.personal_religion
          ? `<dt>Personal religion</dt><dd>${d.personal_religion}</dd>`
          : ''}
      `
    )
  },
  map_units: el => {
    customLeafletMap(
      el,
      data.units,
      'vk_group',
      (d) => `
        ${d.existence ? `<em class="tooltip__single-item">${d.existence}</em>` : ''}
        ${(d.location_english || d.location_russian)
          ? `<dt>Location</dt><dd>${d.location_english}</dd><dd>${d.location_russian}</dd>`
          : ''}
        ${(d.full_unit_affiliation_english || d.full_unit_affiliation_russian)
          ? `<dt>Unit affiliation</dt><dd>${d.full_unit_affiliation_english}</dd><dd>${d.full_unit_affiliation_russian}</dd>`
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
