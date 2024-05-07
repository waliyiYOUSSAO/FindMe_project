document.addEventListener('DOMContentLoaded', function() {
    const identifiant_js = document.getElementById('identifiant');
    const get_id = document.getElementById('password');
    const correct_id = '08052024';

    identifiant_js.addEventListener('submit', function(event) {
        event.preventDefault(); // prevent the default form submission behavior

        if (get_id.value === correct_id) {
            window.location.href = 'map.html';
        } else {
            alert("Mot de passe incorrect");
        }
    });
});
