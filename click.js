
var game_matrix = [];
var old_game_matrix = [];

var height = 500; // 500 px
var cube_height = 28; // 28 px
var cube_width = cube_height;
var no_of_rows = Math.round(height / cube_height);
var no_of_cols = 10;

var total_cubes = no_of_cols * no_of_rows;

timer_interval = null;

function new_game() {

	game_matrix = [];
	old_game_matrix = [];

	timer_value = 0;
	clearInterval(timer_interval);
	timer_interval = setInterval(update_timer, 1000);

	for (i = 0; i < no_of_rows; i++) {

		// html += "<tr>";
		cur_row = [];

		for (j = 0; j < no_of_cols; j++) {
			// Get random number between 1 and total number of supported cubes
			var total_colours = parseInt($('#difficulty_level').val(), 10);
			var cur_index = Math.floor(1 + (Math.random() * total_colours))

			cur_row.push(cur_index);
			
		}

		game_matrix.push(cur_row);
	}

	old_game_matrix = $.extend(true, [], game_matrix);
	draw_from_game_matrix();

	prepare_bomb_reception();
	update_scores(total_cubes);
}

function draw_from_game_matrix() {

	var html = "<table>";

	for (i = 0; i < no_of_rows; i++) {

		html += "<tr>";
		cur_row = game_matrix[i];

		for (j = 0; j < no_of_cols; j++) {

			var cur_index = cur_row[j]
			var cube_class = "cube" + cur_index;

			html += "<td class='cube " + cube_class + "' data-cube_index='" + cur_index + "' data-row='" + i + "' data-col='" + j + "'>&nbsp;</td>";
			
		}

		html += "</tr>";
	}

	html += "</table>";

	$('#game_area').html(html);
}

// When I click on a cube
var cubes_to_be_processed = [];
var cube_index_to_remove = "";

$('#game_area').on('click', '.cube', function() {
	var cube_index = $(this).data('cube_index');
	var row = $(this).data('row');
	var col = $(this).data('col');

	// Check if it has valid neighbours
	var neighbour_found = check_if_neighbour_exists(row, col, cube_index);

	if (neighbour_found) {
		// Enable and facilitate Undo
		old_game_matrix = $.extend(true, [], game_matrix);
		$('#btn_undo').removeClass('disabled');


		mark_cube_to_remove(row, col);
		cube_index_to_remove = cube_index;
		process_cubes_to_remove();	
	} else {
		// Wrong - No cells
	}

	check_if_move_exists();

});

function check_if_neighbour_exists(row, col, cube_index) {
	// Check if it has valid neighbours
	var neighbour_found = false;

	if (cube_index == 0) {
		return false;
	}

	if (row > 0) {
		if(game_matrix[row - 1][col] == cube_index) {
			neighbour_found = true;
		}
	}

	if (col > 0) {
		if(game_matrix[row][col - 1] == cube_index) {
			neighbour_found = true;
		}
	}

	if (row < no_of_rows - 1) {
		if(game_matrix[row + 1][col] == cube_index) {
			neighbour_found = true;
		}
	}

	if (col < no_of_cols - 1) {
		if(game_matrix[row][col + 1] == cube_index) {
			neighbour_found = true;
		}
	}

	return neighbour_found;
}

function check_if_move_exists() {
	valid_move_exists = false;
	non_white_exists = false;
	non_white = 0;

	for (i = 0; i < no_of_rows; i++) {
		for (j = 0; j < no_of_cols; j++) {
			
			if (game_matrix[i][j] != 0) {
				non_white_exists = true;
				non_white += 1;
			}

			if(check_if_neighbour_exists(i, j, game_matrix[i][j])) {
				valid_move_exists = true;
				// break;
			}
		}

		if(valid_move_exists) {
			// break;
		}
	}

	update_scores(non_white);

	if (non_white_exists == true && valid_move_exists == false) {
		show_game_over(false);
		return;
	} else if (non_white_exists == false && valid_move_exists == false) {
		show_game_over(true);
		return;
	}

	return valid_move_exists;

}

function update_scores(non_white) {
	// Update score
	score = (total_cubes - non_white);
	max_score = total_cubes;

	if (score / max_score <= 0.2) {
		$('.bar-danger').css('width', (100 * score / max_score) + '%');
		$('.bar-danger').show();
		$('.bar-warning').hide();
		$('.bar-success').hide();
	} else if (score / max_score > 0.2 && score / max_score <= 0.5) {
		$('.bar-danger').css('width', '20%');
		$('.bar-warning').css('width', ((100 * score / max_score) - 20) + '%');
		$('.bar-danger').show();
		$('.bar-warning').show();
		$('.bar-success').hide();
	} else {
		$('.bar-danger').css('width', '20%');
		$('.bar-warning').css('width', '30%');
		$('.bar-success').css('width', ((100 * score / max_score) - 50) + '%');
		$('.bar-danger').show();
		$('.bar-warning').show();
		$('.bar-success').show();
	}

	$('#score_value').text(score + " / " + total_cubes);
	$('#blocks_remaining').text((total_cubes - score) + " remaining");
}

function show_game_over(victory) {
	if (victory) {
		alert("You Win");
	} else {
		alert("Game Over");
	}

	clearInterval(timer_interval);
}

function process_cubes_to_remove() {
	while (cubes_to_be_processed.length != 0) {

		var cube_index = cube_index_to_remove;
		var cur_cube = cubes_to_be_processed.shift();
		var row = cur_cube['row'];
		var col = cur_cube['col'];

		if (row > 0) {
			if(game_matrix[row - 1][col] == cube_index) {
				mark_cube_to_remove(row - 1, col);
			}
		}

		if (col > 0) {
			if(game_matrix[row][col - 1] == cube_index) {
				mark_cube_to_remove(row, col - 1);
			}
		}

		if (row < no_of_rows - 1) {
			if(game_matrix[row + 1][col] == cube_index) {
				mark_cube_to_remove(row + 1, col);
			}
		}

		if (col < no_of_cols - 1) {
			if(game_matrix[row][col + 1] == cube_index) {
				mark_cube_to_remove(row, col + 1);
			}
		}

		game_matrix[row][col] = -1;
	}

	remove_marked_cubes();
}

function remove_marked_cubes() {
	for (i = 0; i < no_of_cols; i++) {
		for (j = no_of_rows - 1; j >= 0; j--) {
			if (game_matrix[j][i] == -1 && j != 0) {

				for (k = j; k >= 0; k--) {
					if (k != 0) {
						game_matrix[k][i] = game_matrix[k - 1][i]
					} else {
						game_matrix[k][i] = 0;
					}
				}

				j++;

			} else if (game_matrix[j][i] == -1 && j == 0) {
				game_matrix[j][i] = 0;
			}
		}
	}

	// Check the last row
	for (j = 0; j < no_of_cols - 1; j++) {
		if (game_matrix[no_of_rows - 1][j] == 0) {
			// Shift all to the left
			for (m = j; m < no_of_cols - 1; m++) {
				for (n = 0; n < no_of_rows; n++) {
					game_matrix[n][m] = game_matrix[n][m + 1];
					game_matrix[n][m + 1] = 0;
				}
			}
		}
	}

	draw_from_game_matrix();
}

function mark_cube_to_remove(row, col) {
	cubes_to_be_processed.push({"row": row, "col": col});
}

$(document).ready(function() {
	new_game();
});

$('#btn_undo').on('click', function() {
	game_matrix = $.extend(true, [], old_game_matrix);
	draw_from_game_matrix();
	$(this).addClass('disabled');
});

$('#btn_new_game').on('click', function() {
	new_game();
});

$('.show_help').on('click', function() {
	$('.modal').modal('show');
});

timer_value = 0;
function update_timer() {
	timer_value += 1;

	min = Math.floor(timer_value / 60);
	sec = timer_value % 60;

	if (min < 10) {
		min = "0" + min;
	}

	if (sec < 10) {
		sec = "0" + sec;
	}

	$('#timer_value').text(min + " : " + sec);
}

function prepare_bomb_reception() {
	$('#bomb').draggable({ revert: true });

	$('#game_area td').droppable({
		accept: '#bomb',
		drop: function(event, ui) {
			destroy_nine_cells($(this));
			remove_bomb();
		}
	});

	$('#bomb').show();
	$('#bomb_info').show();
	$('#no_bomb').hide();
}

function destroy_nine_cells(td) {
	row = $(td).data('row');
	col = $(td).data('col');

	// Previous row
	if (row > 0) {
		if (col > 0) {
			game_matrix[row - 1][col - 1] = -1;
		}

		game_matrix[row - 1][col] = -1;

		if (col < no_of_cols - 1) {
			game_matrix[row - 1][col + 1] = -1;
		}
	}

	// Current Row
	if (col > 0) {
		game_matrix[row][col - 1] = -1;
	}

	game_matrix[row][col] = -1;

	if (col < no_of_cols - 1) {
		game_matrix[row][col + 1] = -1;
	}

	// Next Row
	if (row < no_of_rows - 1) {
		if (col > 0) {
			game_matrix[row + 1][col - 1] = -1;
		}

		game_matrix[row + 1][col] = -1;

		if (col < no_of_cols - 1) {
			game_matrix[row + 1][col + 1] = -1;
		}
	}

	remove_marked_cubes();
}

function remove_bomb() {
	$('#bomb').hide();
	$('#bomb_info').hide();
	$('#no_bomb').show();
}

$("#bookmarkme").click(function() {

      if (window.sidebar) { // Mozilla Firefox Bookmark
        window.sidebar.addPanel(location.href,document.title,"");
      } else if(window.external) { // IE Favorite
        window.external.AddFavorite(location.href,document.title); }
      else if(window.opera && window.print) { // Opera Hotlist
        this.title=document.title;
        return true;
  }

});