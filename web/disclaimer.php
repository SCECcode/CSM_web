<?php
require_once("php/navigation.php");
$header = getHeader("Disclaimer");
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <link href="css/vendor/font-awesome.min.css" rel="stylesheet">

    <link rel="stylesheet" href="css/vendor/bootstrap.min.css">
    <link rel="stylesheet" href="css/vendor/bootstrap-grid.min.css">
    <link rel="stylesheet" href="css/vendor/jquery-ui.css">
    <link rel="stylesheet" href="css/vendor/glyphicons.css">
    <link rel="stylesheet" href="css/cxm-ui.css">

    <script type='text/javascript' src='js/vendor/popper.min.js'></script>
    <script type='text/javascript' src='js/vendor/jquery.min.js'></script>
    <script type='text/javascript' src='js/vendor/bootstrap.min.js'></script>
    <script type='text/javascript' src='js/vendor/jquery-ui.js'></script>
    <title>SCEC Community Stress Model Web Viewer: Disclaimer</title>
</head>
<body>
<?php echo $header; ?>

<div class="container info-page-container scec-main-container">

    <h1>Disclaimer</h1>
    <div>
       <p>The Community Stress Model (CSM) Web Viewer is provided “as is” and without warranties 
          of any kind. While <a href="https://www.scec.org">SCEC</a> and
	  <a href="https://www.scec.org/research/csm">the CSM development team</a> have made every
	  effort to provide data from reliable sources or methodologies, SCEC and the CSM development
	  team do not make any representations or warranties as to the accuracy, completeness, 
	  reliability, currency, or quality of any data provided herein. SCEC and the CSM development
	  team do not intend the results provided by this viewer to replace the sound judgment of a
	  competent professional, who has knowledge and experience in the appropriate field(s) of 
	  practice. By using this viewer, you accept to release SCEC and the CSM development team of 
          any and all liability.</p>
       <p>More information about the CSM can be found at: <a href="https://www.scec.org/research/csm">https://www.scec.org/research/csm</a>.</p>
    </div>
</div>
</body>
</html>
