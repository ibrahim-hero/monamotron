# Learning brief: how neural networks learn

**Audience:** a curious beginner. **Language:** English.

**Learning outcome:** understand a supervised learning loop: examples feed a network; a loss measures prediction error; backpropagation computes gradients; an optimizer changes weights and biases; repeated practice is evaluated on separate examples.

## Visual direction

A deep forest chalkboard, warm white handwritten Excalifont headings, crisp Nunito explanatory text, mint forward signals, yellow loss/gradient marks, and coral parameter updates. The central illustration is a real small digit classifier, with a return arrow that makes learning look like a feedback loop. Original pixel art, network geometry, a loss curve, and a weight dial replace generic process boxes.

Desktop composition: example → large neural network → loss across the upper board; backpropagation → update → practice returns across the lower board. The parameter-update arrow returns directly to the network. Phones unfold the same six concepts vertically.

## Storyboard

1. **0–6s, orient:** learning means adjusting numbers, not adding magic.
2. **6–13s, example:** a 5 × 7 pixel digit and its label; toy task is “7” versus “1”.
3. **13–25s, forward pass:** 35 inputs, six sigmoid hidden units, one sigmoid score. The input layer is shown compressed; it is not a five-input model.
4. **25–34s, loss:** compare the score with the known label using binary cross-entropy. For the positive example, loss = −ln(score).
5. **34–45s, backpropagation:** use the chain rule to compute how each parameter affects loss. Gradients are information about changes, not changed weights yet.
6. **45–55s, update:** apply one real small gradient-descent step; show an actual weight and prediction before/after.
7. **55–64s, practice:** replay 200 computed full-batch training passes on 120 noisy toy digits, with loss on 48 separately generated held-out digits.
8. **64–72s, takeaway:** repeat the loop and check unfamiliar examples. Original supporting images, replay/video export, and a verified further-learning link remain on the completed board.

## Numerical integrity

The illustrated scores, gradients, weight update, and learning curves come from `learning.mjs`, not invented plotting values. The experiment uses a 35–6–1 sigmoid network with 223 parameters and binary cross-entropy. One positive-example update is followed by 200 full-batch updates on a balanced toy dataset. Held-out examples never enter gradient calculations.

The diagram is an instructional toy, not a claim about accuracy on real handwritten digits. Training loss falling does not by itself establish generalization; held-out evaluation is shown explicitly. The supporting neuron image is a separately labeled worked example with independently computed arithmetic.

## Deliverables

- Self-contained offline `index.html` with drawing, typing, captions, controls, and a selectable transcript.
- Editable lesson JSON and lesson-specific SVG renderer.
- Original SVG/PNG supporting images.
- An actual full-length captioned WebM video, decoded and checked after export.
