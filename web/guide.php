<?php
require_once("php/navigation.php");
$header = getHeader("User Guide");

/**
 * @var string $host_site_actual_path from navigation.php
 */
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
    <title>Community Stress Model Explorer: User Guide</title>
</head>
<body>
<?php echo $header; ?>

<div class="container info-page-container scec-main-container guide">

    <h1>CSM Explorer User Guide</h1>
        <div class="col-12">
            <figure class="cxm-interface figure float-lg-right">
                <img src="img/csm-explorer.png" class="figure-img img-fluid" alt="Screen capture of CSM explorer interface">
                <figcaption class="figure-caption">Screen capture of CSM explorer interface</figcaption>
            </figure>
            <h4><strong>Community Stress Model (CSM) Explorer Overview</strong></h4>

		<p>The CSM explorer provides interactive map-based views of the 
                   <a href="https://doi.org/10.5281/zenodo.15171026">CSM v2024</a>
		   contributed models.  The explorer allows users to select the model of interest, a 
		   scalar stress metric to display, and a depth of interest (using drop down menus 
		   at the left of the interface).  Users can add additional data overlays of 
		   Borehole SHmax azimuths (from Luttrell & Hardebeck, 2021), Community Fault Model 
		   fault traces, Geologic Framework Model regions (a component of the SCEC Community 
		   Rheology Model), or upload their own data in kml or kmz format.  Users can also 
		   download selected model data without having to download the entire CSM model archive.
		   The pages on this site include the 
		   <a href="<?php echo $host_site_actual_path; ?>">CSM explorer page</a>, this user guide, <a href="cite">citing usage of this dataset</a>,
		   <a href="disclaimer">disclaimer</a>, and
                   a <a href="contact">contact information</a> page.</p>

		 <p>The interactive map on the right displays the geographic extent of the selected 
		    model, using the selected metric at the selected depth.  The color scale at the 
		    bottom left indicates the range of values associated with each color in the 
		    current view.  In the top right corner of the interactive map, there is a 
		    pull-down menu that allows the base map to be changed.  By default, the map shown 
		    is 
		    <a href="https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer">ESRI Topographic</a>.
                    The other map types are: 
                    <a href="https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer">ESRI Imagery</a>,
                    <a href="http://jawg.io">Jawg Light</a>, <a href="http://jawg.io">Jawg Dark</a>,
                    <a href="https://www.openstreetmap.org">OSM Streets Relief</a>,
                    <a href="https://opentopomap.org">OTM Topographic</a>,
                    <a href="https://www.openstreetmap.org">OSM Street</a>, and 
                    <a href="https://services.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer">ESRI Terrain</a>.</p>

		 <p>The map interface has a small default size, but the map interface can be resized 
		    by clicking on the black dashed square icon located in the bottom right corner 
		    of the interface.  Three size options are available, small (default), medium, and 
		    full-screen.  The medium and full-screen sizes hide some of the tools, so these 
		    options are provided for visualization and data comparison purposes and are not 
                    intended to be used when querying the model for download.</p>

                 <p><i>To report any bugs or issues, please see the <a href="contact">contact page</a>.</i></p>

            <h4><strong>Explore CSM models</strong></h4>
		 <p>The CSM explorer has two modes: “Explore Models”, and “Select Region”, accessed by the 
		    rectangular buttons at the top left.  “Explore Models” is the default mode and allows 
		    users to select a model contribution, a stress metric, and a depth using dropdown menus.
		    The interactive map at right updates with each selection.  Users can adjust the transparency
		    or opacity of the model using the “Change Opacity” slider, or  return to the default view
                    at any time using the “Reset” button.</p>

		 <p>The “Select CSM Model” dropdown menu lists the short name of each contributed model, and 
		    whether it is a model of stress or stressing rate.  For details about contributed models,
		    see the <a href="https://www.scec.org/science/csm">CSM homepage</a> or the
                    <a href="https://doi.org/10.5281/zenodo.15171026">CSM archive</a>.</p>

		 <p>The “Select Model Metric” dropdown menu lists available scalar metrics, a brief description,
		    and whether the metric gives an indication of stress orientation or magnitude.  See below for
		    a summary of available metrics.  Note that not all metrics are applicable to every model 
		    (unavailable metrics/depths are shown in light gray).  If you select a metric that is not 
		    available for the selected model, the explorer will display the notification “switching to a 
                    different metric/depth for this model” and revert to the default metric for that model.</p>

		 <p>Users can select the depth of interest using the “Select Model Depth” dropdown menu.  Note 
		    that not all depths are applicable to every model (unavailable metrics/depths are shown in 
		    light gray).  If you select a depth that is not available for the selected model, the explorer 
		    will display the notification “switching to a different metric/depth for this model” and 
		    revert to the default depth for that model.  Note that some models do not vary with depth,
		    even though they may be applicable to multiple depths.  If you select a different depth for 
		    a model that does not vary with depth, the interactive explorer will update but the image will 
                    not change.</p>
 
		 <p>A brief explanation of the selected model and metric appears at the bottom left, updated 
             each time a new model or metric is selected. A few models also include an "information button" (<span class="glyphicon glyphicon-info-sign"></span>) with further details about the visualization.  For further details about each model,
		    see the <a href="https://www.scec.org/science/csm">CSM homepage</a> or the 
		    <a href="https://doi.org/10.5281/zenodo.15171026">CSM archive</a>.  For additional stress 
		    metrics indicating orientation and magnitude, see the
                    <a href="https://doi.org/10.5281/zenodo.15171026">CSM archive</a>.</p>

	    <h4><strong>Stress Metrics Available for Viewing</strong></h4>

                 <p>Users can view CSM model contributions using the following scalar metrics:</p>


		 <p><b>SHmax</b> indicates the azimuth [orientation] of the most compressive horizontal stress
		    is north/south (0), east/west (+/-90), northeast/southwest (positive), or 
                    northwest/southeast (negative).</p>

		 <p><b>Aphi</b> combines the shape parameter ratio of principal stresses with the expected 
		    faulting regime based on which principal stress is most vertical.  Fault regime is normal
                    faulting (0-1), strike-slip faulting (1-2), or reverse faulting (2-3).</p>

		 <p><b>Isotropic stress</b> indicates the mean of the principal stresses (S1+S2+S3)/3 is 
		    tensional (positive) or compressional (negative).  For easier visualization, the display
                    range excludes the highest and lowest 0.1% of values.</p>

		 <p><b>Differential stress</b> is the difference between the most tensional and most
		    compressional principal stresses S1-S3.  It is always positive.  For easier visualization,
		    the display range excludes the highest and lowest 0.1% of values.</p>

		 <p>Other scalar metrics of both orientation and magnitude are available from the 
		    <a href="https://doi.org/10.5281/zenodo.15171026">CSM archive</a>.  See 
		    <a href="https://doi.org/10.5281/zenodo.15171026">CSM archive metadata</a> for details.</p>

	    <h4><strong>Select Region to Download Data Subset</strong></h4>

		 <p>The “Select Region” mode, accessed by the rectangular button at the top left, allows 
		    users to download data from a single contributed model over a single selected subregion.
		    Users can draw a box around their region of interest, or enter 
		    longitude and latitude bounds
		    in the boxes at left and click the “get data” button.  The selected region will be 
		    displayed as a gray box on the interactive map.</p>

		 <p>Once a user selects a region, the table at the bottom of the interface will populate with
		    the name and depth of the current model view, along with an indication of how many data 
                    points of the current model and depth are contained in the region.</p>

		 <p>When the user is satisfied with their model, depth, and region selections, use the red 
             download button (<span class="glyphicon glyphicon-download"></span>) to download a file in
		    .csv format containing only the points from the selected model, depth, and subregion.
		    The downloaded file contains the full record for each point, including the cartesian
                    stress tensor components and all available scalar metrics.</p>

		 <p>To download data from the same selected subregion for a different model or depth, simply
		    select a different model or depth using the dropdown menus at the top left of the interface.
		    The table at the bottom will update with an additional entry allowing you to download the 
                    new data subset.</p>

		 <p>Users can remove entries from the download table at any time by clicking on the trashcan 
		    button at the left, or can clear all entries by clicking the “Reset Region” button by the
                    longitude and latitude range boxes.</p>

		 <p>The complete set of CSM model contributions, including cartesian stress tensor components,
		    additional scalar metrics, and associated metadata are available from the 
                    <a href="https://doi.org/10.5281/zenodo.15171026">CSM archive</a>.</p>

	    <h4><strong>Additional Data Overlays</strong></h4>
		 <p>At the top of the interface, there are checkboxes that turn on or off additional data 
		    overlays that the user may find helpful.</p>

		 <p>Borehole SHmax adds SHmax data from Table 1 of 
                    <a href="https://agupubs.onlinelibrary.wiley.com/doi/full/10.1029/2020JB020817">Luttrell and Hardebeck (2021)</a>.
		    SHmax azimuth is indicated both by a black bar centered at the borehole location and 
		    by a circle at the borehole location colored by SHmax value.  This data can be downloaded
		    in .csv format <a target="_blank" href="https://files.scec.org/s3fs-public/LuttrellHardebeckJGR2021_Table1.csv">here</a>
                    or by clicking the red down arrow button (<span class="glyphicon glyphicon-download"></span>).</p>

		 <p>CFM7.0 adds the surface traces of version 7.0 of the 
                    <a href="https://www.scec.org/research/cfm">Community Fault Model</a>
		    faults, with blind faults indicated by a dashed line.  Click on each individual fault to
		    see a popup of its name.</p>

		 <p>GFM adds the <a href="https://www.scec.org/research/gfm">Geologic Framework Model</a>
		    regions defined as a component of the
		    <a href="https://www.scec.org/research/crm">Community Rheology Model</a>.  Click each 
                    polygon to see a popup of the region’s name.</p>

	    <h4><strong>KML/KMZ Uploader</strong></h4>

		 <p>Users can upload their own Google Earth kml/kmz files for display on the map interface.
		    This is intended to allow users to compare their own data to the CSM.  The kml/kmz uploader
		    currently supports point/line data (kml/kmz) and image overlays (kmz only).  kml/kmz files
		    with remote links are currently not supported.  If you discover a kml/kmz file that will 
		    not display correctly, please contact us using the information on the 
                    <a href="contact">contact page</a>.</p>

	    <h4><strong>Browser Requirements</strong></h4>

                 <p>This site supports the latest versions of
                    <a href="https://www.google.com/chrome/">Chrome</a>,
                    <a href="https://www.microsoft.com/en-us/windows/microsoft-edge">Microsoft Edge</a>,
                    <a href="https://www.mozilla.org/en-US/firefox/">Firefox</a>, and
                    <a href="https://www.apple.com/safari/">Safari</a>.</p>

		 <p>More information, including a complete model archive, can be found at: 
                    <a href="https://www.scec.org/science/csm">https://www.scec.org/science/csm</a>.</p>

</div>
</body>
</html>
