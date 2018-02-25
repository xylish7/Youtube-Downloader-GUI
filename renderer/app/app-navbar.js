// On hover, display general-settings button color
const $generalSettings = $('#general-settings')
$generalSettings.on('mouseover', () => {
  document.getElementById('setting-icon').style.color = 'rgb(254, 57, 96)'
})
$generalSettings.on('mouseleave', () => {
  document.getElementById('setting-icon').style.color = 'rgba(254, 57, 96, 0.5)'
})

// Open modal
const $modal = $('.modal')
$generalSettings.on('click', () => {
  $modal.addClass('is-active')
})

// Close modal
const $closeMolad = $('.close-modal')
const $switchSettings = $('#switch-settings')
$closeMolad.on('click', () => {
  $modal.removeClass('is-active')

  // Change to 'General Settings' section on modal close
  if ($switchSettings.attr('checked')) {
    $switchSettings.prop('checked', false).attr('checked', false)
    $generalSettingsSection.toggle();
    $settingsMessage.toggle()
  }
})


// Toggle between 'General Settings' and 'Updates and releaseas'
const $settingsMessage = $('.settings-message')
const $generalSettingsSection = $('.general-settings-section')
$switchSettings.on('click', function() {
  ($switchSettings.attr('checked')) ? $(this).attr('checked', false) : $(this).attr('checked', true)
    $generalSettingsSection.toggle()
    $settingsMessage.toggle()
})

// Navigation
const $navLink =  $('.nav-link')
const $menuSection = $('.menu-section')
$navLink.on('click', function () {
  // Reset links to deafult css
  $navLink.find('a:first').removeClass('is-active')
  $menuSection.addClass('hide-section')

  // Apply css style on click
  $(this).find('a:first').addClass('is-active')

  // Get selected page
  // Get id of selected link
  let selectedLink =  $(this).attr('id')
  // Split the id and take the first part of it
  let selectedSection = selectedLink.split('-')
  // Create section name to shpw
  selectedSection = `${selectedSection[0]}-section`
  // Show section
  $(`#${selectedSection}`).removeClass('hide-section')
})


